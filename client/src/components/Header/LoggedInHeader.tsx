import { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authAtom } from '../../store/atoms/atoms';
import { signOut } from '../../utils/apiService/authAPI';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { X, Upload } from "lucide-react";
import { toast } from '../../hooks/use-toast';

interface IssueFormData {
  name: string;
  heading: string;
  description: string;
  screenshots: File[];
}

function LoggedInHeader() {
  const [isMobileMenuOpen] = useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [formData, setFormData] = useState<IssueFormData>({
    name: '',
    heading: '',
    description: '',
    screenshots: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const auth = useRecoilValue(authAtom);
  const setAuth = useSetRecoilState(authAtom);
  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      await signOut();
      setAuth({
        loading: false,
        isAuthenticated: false,
        userInfo: {
          id: 0,
          email: '',
          permissions: [],
          name: '',
          role: {
            id: 0,
            name: ''
          },
        }
      });

      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.screenshots.length > 5) {
      toast({
        variant: "destructive",
        title: "Maximum limit exceeded",
        description: "You can only upload up to 5 screenshots."
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      screenshots: [...prev.screenshots, ...files].slice(0, 5)
    }));
  };

  const removeScreenshot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitIssue = async () => {
    // Here you can implement the actual submission logic
    toast({
      title: "Issue Reported Successfully",
      description: "We'll look into this and get back to you soon.",
    });
    setIsIssueDialogOpen(false);
    setFormData({ name: '', heading: '', description: '', screenshots: [] });
  };

  if (auth.loading) {
    return (
      <header className="bg-white shadow-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 animate-pulse">
            <div className="flex">
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-12 bg-gray-300 rounded"></div>
              <div className="h-8 w-12 bg-gray-300 rounded"></div>
              <div className="h-8 w-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  let permissions = [...(auth.userInfo?.permissions || [])];
  permissions.sort((a, b) => a.name.localeCompare(b.name));
  permissions = permissions.filter((item) => item.name.charAt(0) !== '_');

  return (
    <>
      <header className="bg-white shadow-premium border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/i2.png"
                  alt="Company Logo"
                />
              </div>
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                {permissions.map((item) => (
                  <NavLink
                    key={item.id}
                    to={`/${item.name.toLowerCase()}`}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive
                        ? 'border-brand text-brand'
                        : 'border-transparent text-neutral-700 hover:border-brand hover:text-brand'
                      } transition-colors duration-300`
                    }
                  >
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10 border-2 border-brand">
                      <AvatarImage src="/user.png" alt={auth.userInfo?.name || 'User'} />
                      <AvatarFallback>
                        {auth.userInfo?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 border-2 border-neutral-200/50 shadow-lg rounded-xl bg-white/95 backdrop-blur-sm" align="end" >
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-20 w-20 border-2 border-brand shadow-md">
                      <AvatarImage src="/user.png" alt={auth.userInfo?.name || 'User'} />
                      <AvatarFallback>
                        {auth.userInfo?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center space-y-1">
                      <h2 className="text-xl font-semibold text-neutral-800">
                        {auth.userInfo?.name}
                      </h2>
                      <h2 className="text-neutral-600 font-medium">
                        Team : {auth.userInfo.role.name}
                      </h2>

                    </div>
                    <div className="flex col-auto gap-3 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full col-span-2 shadow-sm hover:shadow-md transition-shadow"
                        onClick={() => setIsIssueDialogOpen(true)}
                      >
                        Report Issue
                      </Button>
                      <Button
                        variant="destructiveOutline"
                        className="w-full col-span-2 !mt-0 shadow-sm hover:shadow-md transition-shadow"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu" ref={mobileMenuRef}>
            <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {permissions.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/${item.name.toLowerCase()}`}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-brand transition-colors duration-300 ${isActive ? 'text-brand' : 'text-neutral-700'
                    }`
                  }
                >
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </NavLink>
              ))}
              <div className="mt-3 px-3 space-y-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsIssueDialogOpen(true)}
                >
                  Report Issue
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Help us improve by reporting any issues you've encountered. We'll look into it right away.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={auth.userInfo?.name}
                disabled
                className="bg-neutral-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heading">Title *</Label>
              <Input
                id="heading"
                placeholder="Eg: Unable to Save a View"
                value={formData.heading}
                onChange={(e) => setFormData(prev => ({ ...prev, heading: e.target.value }))}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue you're facing in detail..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="h-32"
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <Label>Screenshots (Optional)</Label>
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div
                      className="flex items-center justify-center w-full h-24 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-brand transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="h-6 w-6 text-neutral-500" />
                        <span className="text-sm text-neutral-500">
                          Click to upload (max 5 images)
                        </span>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                    />
                    {formData.screenshots.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.screenshots.map((file, index) => (
                          <div
                            key={index}
                            className="relative group w-20 h-20 border rounded-lg overflow-hidden"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeScreenshot(index)}
                              className="absolute top-1 right-1 bg-slate-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setIsIssueDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitIssue}
                variant={'brand'}
                disabled={!formData.heading || !formData.description}
              >
                Submit Issue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LoggedInHeader;