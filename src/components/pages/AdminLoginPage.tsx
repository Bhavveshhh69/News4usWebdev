import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Link, useRouter } from '../Router';
import { Shield, Eye, EyeOff, UserCheck } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type UserRole = 'admin' | 'editor' | 'viewer';

interface AdminUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

// Mock admin users for demonstration
const mockAdminUsers: AdminUser[] = [
  {
    email: 'admin@news4us.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator'
  },
  {
    email: 'editor@news4us.com',
    password: 'editor123',
    role: 'editor',
    name: 'Chief Editor'
  },
  {
    email: 'viewer@news4us.com',
    password: 'viewer123',
    role: 'viewer',
    name: 'Content Reviewer'
  }
];

export function AdminLoginPage() {
  const { navigate } = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '' as UserRole | ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication logic
    const user = mockAdminUsers.find(
      u => u.email === formData.email && u.password === formData.password && u.role === formData.role
    );

    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      // Store user session (in real app, use proper session management)
      localStorage.setItem('adminUser', JSON.stringify(user));
      navigate('/admin');
    } else {
      toast.error('Invalid credentials or role selection');
    }

    setIsLoading(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'editor':
        return '✏️';
      case 'viewer':
        return '👁️';
      default:
        return '👤';
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Full system access, user management, and all privileges';
      case 'editor':
        return 'Content creation, editing, and publishing capabilities';
      case 'viewer':
        return 'Read-only access to content and analytics';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <Link to="/">
            <h1 className="text-2xl font-bold cursor-pointer">
              <span className="text-red-600">NEWS</span>
              <span className="text-gray-900 dark:text-white">4US</span>
            </h1>
          </Link>
          <CardTitle>Admin Portal</CardTitle>
          <CardDescription>Secure access for authorized personnel only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your admin email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Access Level</Label>
              <Select onValueChange={(value) => handleInputChange('role', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <span>{getRoleIcon('admin')}</span>
                      <span>Administrator</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center space-x-2">
                      <span>{getRoleIcon('editor')}</span>
                      <span>Editor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center space-x-2">
                      <span>{getRoleIcon('viewer')}</span>
                      <span>Viewer</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.role && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getRoleDescription(formData.role as UserRole)}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Access Admin Portal
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Demo Credentials:</h4>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
              <div><strong>Admin:</strong> admin@news4us.com / admin123</div>
              <div><strong>Editor:</strong> editor@news4us.com / editor123</div>
              <div><strong>Viewer:</strong> viewer@news4us.com / viewer123</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link 
              to="/auth" 
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Regular User Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}