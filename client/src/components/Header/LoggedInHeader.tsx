import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authAtom, showFabAtom } from '../../store/atoms/atoms';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Upload, Info } from "lucide-react";
import { toast } from '../../hooks/use-toast';

// Updated interface to include severity
interface IssueFormData {
  name: string;
  heading: string;
  severity: string;
  description: string;
  screenshots: File[];
}

function LoggedInHeader() {
  const [isMobileMenuOpen] = useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [formData, setFormData] = useState<IssueFormData>({
    name: '',
    heading: '',
    severity: '', // Added severity field with empty default
    description: '',
    screenshots: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const auth = useRecoilValue(authAtom);
  const setAuth = useSetRecoilState(authAtom);
  const navigate = useNavigate();
  const setShowFab = useSetRecoilState(showFabAtom);

  useEffect(() => {
    setShowFab(!isIssueDialogOpen);
  }, [isIssueDialogOpen])


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
        description: "You can only upload up to 5 screenshots.",
        duration: 3000
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
    const formDataToSend = new FormData();
    formDataToSend.append('name', auth.userInfo?.name || '');
    formDataToSend.append('heading', formData.heading);
    formDataToSend.append('severity', formData.severity); // Append severity to form data
    formDataToSend.append('description', formData.description);
    formData.screenshots.forEach((file, index) =>
      formDataToSend.append(`screenshots[${index}]`, file)
    );

    try {
      const response = await fetch(import.meta.env.VITE_FEEDBACK_FLOW_URL, {
        method: 'POST',
        body: formDataToSend,
        // Remove credentials since they are not needed
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      console.log('Issue reported successfully:', result);
      setShowFab(false);
      setTimeout(()=>{
        setShowFab(true);
      }, 3500)
      toast({
        title: 'Issue Reported Successfully',
        description: "We'll look into this and get back to you soon.",
        duration : 3000
      });

      // Reset the form state
      setIsIssueDialogOpen(false);
      setFormData({ name: '', heading: '', severity: '', description: '', screenshots: [] });
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast({
        variant: 'destructive',
        title: 'Error Reporting Issue',
        description: 'Something went wrong. Please try again.',
      });
    }
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
                        ? 'border-brand  text-brand  '
                        : 'border-transparent text-neutral-700 hover:border-brand hover:text-brand'
                      } transition-colors duration-300 text-lg`
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
                readOnly
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
            {/* New Severity Field with Tooltip */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="severity">Severity *</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-neutral-500 " />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="font-bold mb-1">Severity levels:</p>
                      <ul className="text-sm space-y-1">
                        <li><span className="font-bold">Low:</span> Can be resolved in the next scheduled update</li>
                        <li><span className="font-bold">Moderate:</span> Should be resolved before the end of current work week</li>
                        <li><span className="font-bold">High:</span> Requires immediate attention (same day or ASAP)</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select issue severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="moderate">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      Moderate
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
                disabled={!formData.heading || !formData.severity || !formData.description}
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