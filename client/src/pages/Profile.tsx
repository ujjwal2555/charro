import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Building2, 
  FileText, 
  Lock, 
  DollarSign, 
  Plus,
  Briefcase,
  Calendar,
  MapPin,
  Phone,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Skill, Certification, SalaryComponent } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Profile() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [about, setAbout] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isCertDialogOpen, setIsCertDialogOpen] = useState(false);

  // Fetch skills
  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ['/api/users', currentUser?.id, 'skills'],
    enabled: !!currentUser,
  });

  // Fetch certifications
  const { data: certifications = [] } = useQuery<Certification[]>({
    queryKey: ['/api/users', currentUser?.id, 'certifications'],
    enabled: !!currentUser,
  });

  // Fetch salary components (only for admin/payroll or own data)
  const { data: salaryComponents } = useQuery<SalaryComponent>({
    queryKey: ['/api/users', currentUser?.id, 'salary-components'],
    enabled: !!currentUser && ['admin', 'payroll', 'employee'].includes(currentUser?.role || ''),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', '/api/users/me', data),
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: (skillName: string) =>
      apiRequest('POST', `/api/users/${currentUser?.id}/skills`, { skillName }),
    onSuccess: () => {
      toast({
        title: 'Skill Added',
        description: 'Your skill has been added successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.id, 'skills'] });
      setNewSkill('');
      setIsSkillDialogOpen(false);
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (skillId: string) => apiRequest('DELETE', `/api/skills/${skillId}`),
    onSuccess: () => {
      toast({
        title: 'Skill Removed',
        description: 'Skill has been removed from your profile',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.id, 'skills'] });
    },
  });

  const addCertificationMutation = useMutation({
    mutationFn: (certificationName: string) =>
      apiRequest('POST', `/api/users/${currentUser?.id}/certifications`, { certificationName }),
    onSuccess: () => {
      toast({
        title: 'Certification Added',
        description: 'Your certification has been added successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.id, 'certifications'] });
      setNewCertification('');
      setIsCertDialogOpen(false);
    },
  });

  const deleteCertificationMutation = useMutation({
    mutationFn: (certificationId: string) => apiRequest('DELETE', `/api/certifications/${certificationId}`),
    onSuccess: () => {
      toast({
        title: 'Certification Removed',
        description: 'Certification has been removed from your profile',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.id, 'certifications'] });
    },
  });

  const handleSaveAbout = () => {
    updateProfileMutation.mutate({ about, hobbies });
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkillMutation.mutate(newSkill.trim());
    }
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      addCertificationMutation.mutate(newCertification.trim());
    }
  };

  if (!currentUser) return null;

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
    hr: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    payroll: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800',
    employee: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800'
  };

  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Salary calculations from salary components if available
  const monthlyWage = salaryComponents?.monthlyWage || 0;
  const yearlyWage = salaryComponents?.yearlyWage || monthlyWage * 12;
  const workingDays = salaryComponents?.workingDays || 22;
  const workingHours = parseFloat(String(salaryComponents?.workingHours || 8));
  const breakTime = parseFloat(String(salaryComponents?.breakTime || 1));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and settings
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start">
            <Avatar className="w-32 h-32 text-4xl">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Badge className={`mt-4 ${roleColors[currentUser.role]}`} data-testid="badge-role">
              {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </Badge>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-name">
                <User className="w-4 h-4 text-muted-foreground" />
                {currentUser.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Login ID</p>
              <p className="font-semibold font-mono text-sm" data-testid="text-login-id">
                {(currentUser as any).loginId || currentUser.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-email">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {currentUser.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Mobile</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-mobile">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {(currentUser as any).mobile || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Company</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-company">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                {(currentUser as any).company || 'Organization Inc'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Department</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-department">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                {currentUser.department}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Manager</p>
              <p className="font-semibold" data-testid="text-manager">
                {(currentUser as any).manager || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-location">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {(currentUser as any).location || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resume" data-testid="tab-resume">
            <FileText className="w-4 h-4 mr-2" />
            Resume
          </TabsTrigger>
          <TabsTrigger value="private" data-testid="tab-private">
            <User className="w-4 h-4 mr-2" />
            Private Info
          </TabsTrigger>
          <TabsTrigger value="salary" data-testid="tab-salary">
            <DollarSign className="w-4 h-4 mr-2" />
            Salary Info
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <Textarea 
              placeholder="Tell us about yourself..."
              className="min-h-32"
              value={(currentUser as any).about || ''}
              disabled
              data-testid="textarea-resume-about"
            />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="text-sm" data-testid={`badge-skill-${skill.id}`}>
                      {skill.skillName}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No skills added yet</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Certification</h3>
              <div className="flex flex-wrap gap-2">
                {certifications.length > 0 ? (
                  certifications.map((cert) => (
                    <Badge key={cert.id} variant="secondary" className="text-sm" data-testid={`badge-cert-${cert.id}`}>
                      {cert.certificationName}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No certifications added yet</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">About</h3>
              <Button size="sm" variant="ghost" onClick={handleSaveAbout} data-testid="button-save-about">
                Save
              </Button>
            </div>
            <Textarea 
              placeholder="Tell us about yourself..."
              className="min-h-32"
              value={about || (currentUser as any).about || ''}
              onChange={(e) => setAbout(e.target.value)}
              data-testid="textarea-about"
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">My hobbies</h3>
            <Textarea 
              placeholder="Share your hobbies and interests..."
              className="min-h-32"
              value={hobbies || (currentUser as any).hobbies || ''}
              onChange={(e) => setHobbies(e.target.value)}
              data-testid="textarea-hobbies"
            />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Skills</h3>
                <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" data-testid="button-add-skill">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Skills
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Skill</DialogTitle>
                      <DialogDescription>
                        Add a new skill to your profile
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="skill-name">Skill Name</Label>
                        <Input
                          id="skill-name"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Enter skill name"
                          data-testid="input-skill-name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddSkill} data-testid="button-confirm-add-skill">
                        Add Skill
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="text-sm group" data-testid={`badge-skill-edit-${skill.id}`}>
                      {skill.skillName}
                      <button
                        onClick={() => deleteSkillMutation.mutate(skill.id)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No skills added yet</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Certification</h3>
                <Dialog open={isCertDialogOpen} onOpenChange={setIsCertDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" data-testid="button-add-certification">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Certification
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Certification</DialogTitle>
                      <DialogDescription>
                        Add a new certification to your profile
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cert-name">Certification Name</Label>
                        <Input
                          id="cert-name"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          placeholder="Enter certification name"
                          data-testid="input-certification-name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddCertification} data-testid="button-confirm-add-certification">
                        Add Certification
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {certifications.length > 0 ? (
                  certifications.map((cert) => (
                    <Badge key={cert.id} variant="secondary" className="text-sm group" data-testid={`badge-cert-edit-${cert.id}`}>
                      {cert.certificationName}
                      <button
                        onClick={() => deleteCertificationMutation.mutate(cert.id)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No certifications added yet</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="salary" className="space-y-4">
          {currentUser.role === 'admin' || currentUser.role === 'payroll' || true ? (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Salary Info</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-accent rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Month Wage</p>
                  <p className="text-2xl font-bold">₹{monthlyWage.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">/Month</p>
                </div>
                <div className="p-4 bg-accent rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Yearly wage</p>
                  <p className="text-2xl font-bold">₹{yearlyWage.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">/Yearly</p>
                </div>
                <div className="p-4 bg-accent rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Working Days</p>
                  <p className="text-2xl font-bold">{workingDays}</p>
                  <p className="text-xs text-muted-foreground mt-1">No of working days</p>
                </div>
                <div className="p-4 bg-accent rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Break Time</p>
                  <p className="text-2xl font-bold">{workingHours}</p>
                  <p className="text-xs text-muted-foreground mt-1">{breakTime} hrs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4">Salary Components</h4>
                  <div className="space-y-3">
                    {salaryComponents && (
                      <>
                        <SalaryItem
                          title="Basic Salary"
                          description="Salary deducted from company's total taxable & lipped on monthly basis"
                          amount={salaryComponents.basicSalary}
                          percentage={parseFloat(String(salaryComponents.basicSalaryPercent))}
                        />
                        <SalaryItem
                          title="Overtime Allowance"
                          description="Additional compensation for hours worked beyond regular schedule"
                          amount={salaryComponents.overtimeAllowance}
                          percentage={parseFloat(String(salaryComponents.overtimePercent))}
                        />
                        <SalaryItem
                          title="Performance Bonus"
                          description="Variable bonus paid for meeting performance goals"
                          amount={salaryComponents.performanceBonus}
                          percentage={parseFloat(String(salaryComponents.performanceBonusPercent))}
                        />
                        <SalaryItem
                          title="Leave Travel Allowance"
                          description="LTA is paid by the company for vacation/travel expenses"
                          amount={salaryComponents.leaveTravelAllowance}
                          percentage={parseFloat(String(salaryComponents.leaveTravelPercent))}
                        />
                        <SalaryItem
                          title="Fixed Allowance"
                          description="Fixed allowance portion of wages is determined after excluding"
                          amount={salaryComponents.fixedAllowance}
                          percentage={parseFloat(String(salaryComponents.fixedAllowancePercent))}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Provident Fund (PF) Contribution</h4>
                  <div className="space-y-3 mb-6">
                    {salaryComponents && (
                      <>
                        <DeductionItem
                          title="Employer"
                          description="Employer's contribution brought to the EPF scheme"
                          amount={salaryComponents.pfEmployer}
                          percentage={parseFloat(String(salaryComponents.pfEmployerPercent))}
                        />
                        <DeductionItem
                          title="Employee"
                          description="Employee's EPF is a specified % of the basic salary"
                          amount={salaryComponents.pfEmployee}
                          percentage={parseFloat(String(salaryComponents.pfEmployeePercent))}
                        />
                      </>
                    )}
                  </div>

                  <h4 className="font-semibold mb-4 mt-6">Tax Deductions</h4>
                  <div className="space-y-3">
                    {salaryComponents && (
                      <>
                        <DeductionItem
                          title="Professional Tax"
                          description="Professional Tax deducted from the gross salary"
                          amount={salaryComponents.professionalTax}
                          percentage={0}
                        />
                        <DeductionItem
                          title="Income Tax"
                          description="Tax amount based on the gross taxable amount"
                          amount={salaryComponents.incomeTax}
                          percentage={parseFloat(String(salaryComponents.incomeTaxPercent))}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <p className="text-muted-foreground">
                Salary information is only available to Admin and Payroll officers.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Security & Access</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Login ID</p>
                <p className="font-semibold font-mono bg-accent px-3 py-2 rounded-md inline-block">
                  {(currentUser as any).loginId || currentUser.email}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <Badge className="capitalize">{currentUser.role}</Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Status</p>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                  Active
                </Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SalaryItem({ title, description, amount, percentage }: { title: string; description: string; amount: number; percentage: number }) {
  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant="secondary" className="ml-2">{percentage.toFixed(2)}%</Badge>
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-muted-foreground">Amount</p>
        <p className="font-semibold">₹{amount.toLocaleString()} / month</p>
      </div>
    </div>
  );
}

function DeductionItem({ title, description, amount, percentage }: { title: string; description: string; amount: number; percentage: number }) {
  return (
    <div className="p-4 border rounded-md border-destructive/20 bg-destructive/5">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {percentage > 0 && <Badge variant="destructive" className="ml-2">{percentage.toFixed(2)}%</Badge>}
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-muted-foreground">Amount</p>
        <p className="font-semibold text-destructive">₹{amount.toLocaleString()} / month</p>
      </div>
    </div>
  );
}
