import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Link, useRouter } from '../Router';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, FileText, Users, Settings, LogOut, Plus, Edit, Trash2,
  Eye, Save, Upload, Calendar, Tag, Globe, TrendingUp, BarChart3,
  PieChart as PieChartIcon, Activity, Menu, X, BookOpenCheck, Home, Play
} from 'lucide-react';
import { useContent, ArticleItem, EPaperItem } from '../../store/contentStore';
import { HomePageEditor } from './HomePageEditor';
import YouTubeVideosEditor from './YouTubeVideosEditor.tsx';

// Lightweight toast shim to avoid type import issues
const toast = {
  success: (m: string) => console.log(m),
  error: (m: string) => console.error(m)
};

interface AdminUser {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  name: string;
}

export function AdminDashboard() {
  const { navigate } = useRouter();
  const { 
    articles, categories, tags, addArticle, updateArticle, deleteArticle, 
    addTag, breakingItems, breakingSpeedMs, breakingPauseOnHover, 
    addBreakingItem, removeBreakingItem, updateBreakingItem, 
    setBreakingSpeed, setBreakingPause, setBreakingItems,
    epapers, addEPaper, deleteEPaper
  } = useContent();
  const [currentUser, setCurrentUser] = useState(null as AdminUser | null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingArticle, setEditingArticle] = useState(null as ArticleItem | null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTickerText, setNewTickerText] = useState('');
  const [editingTickerIndex, setEditingTickerIndex] = useState(null as number | null);
  const fileInputRef = useRef(null as any);
  const epaperFileInputRef = useRef(null as any);
  const [newEpaperTitle, setNewEpaperTitle] = useState('');
  const [newEpaperFile, setNewEpaperFile] = useState(null as File | null);

  // Recharts/Router aliases to satisfy type system
  const RLink: any = Link;
  const RResponsiveContainer: any = ResponsiveContainer;
  const RLineChart: any = LineChart;
  const RCartesianGrid: any = CartesianGrid;
  const RXAxis: any = XAxis;
  const RYAxis: any = YAxis;
  const RTooltip: any = Tooltip;
  const RLine: any = Line;
  const RPieChart: any = PieChart;
  const RPie: any = Pie;

  // Analytics data (mock)
  const viewsData = [
    { name: 'Mon', views: 4000 },
    { name: 'Tue', views: 3000 },
    { name: 'Wed', views: 5000 },
    { name: 'Thu', views: 4500 },
    { name: 'Fri', views: 6000 },
    { name: 'Sat', views: 5500 },
    { name: 'Sun', views: 7000 }
  ];

  const categoryData = [
    { name: 'Politics', value: 30, color: '#ef4444' },
    { name: 'Health', value: 25, color: '#06b6d4' },
    { name: 'Sports', value: 20, color: '#10b981' },
    { name: 'Entertainment', value: 25, color: '#8b5cf6' }
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      navigate('/admin-login');
    }
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin-login');
  };

  const handleCreateArticle = () => {
    setEditingArticle({
      id: '',
      title: '',
      category: categories[0] || 'News',
      status: 'published',
      author: currentUser?.name || '',
      publishDate: new Date().toISOString().split('T')[0],
      views: 0,
      content: '',
      summary: '',
      tags: [],
      slug: '',
      imageUrl: '',
      placements: { homeHero: false, homeSection: 'none', categorySpot: 'none' }
    } as any);
    setIsCreating(true);
    setActiveTab('editor');
  };

  const handleSaveArticle = () => {
    if (!editingArticle) return;

    if (isCreating) {
      const newArticle = {
        ...editingArticle,
        id: Date.now().toString(),
        slug: (editingArticle.slug || editingArticle.title).toLowerCase().replace(/\s+/g, '-')
      } as ArticleItem;
      addArticle(newArticle);
      toast.success('Article created successfully');
    } else {
      updateArticle(editingArticle);
      toast.success('Article updated successfully');
    }

    setEditingArticle(null);
    setIsCreating(false);
    setActiveTab('content');
  };

  const handleDeleteArticle = (id: string) => {
    deleteArticle(id);
    toast.success('Article deleted successfully');
  };

  const handleUploadEPaper = () => {
    if (!newEpaperFile || !newEpaperTitle.trim()) {
      toast.error('Please provide a title and select a file.');
      return;
    }
    if (newEpaperFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }
    const maxBytes = 8 * 1024 * 1024; // 8 MB
    if (newEpaperFile.size > maxBytes) {
      toast.error('PDF is too large (max 8 MB).');
      return;
    }

    const blobUrl = URL.createObjectURL(newEpaperFile);
    const newEpaper: EPaperItem = {
      id: `epaper-${Date.now()}`,
      title: newEpaperTitle.trim(),
      uploadDate: new Date().toISOString().split('T')[0],
      fileUrl: blobUrl
    };

    addEPaper(newEpaper);
    toast.success('E-Paper uploaded successfully');
    setNewEpaperTitle('');
    setNewEpaperFile(null);
    if (epaperFileInputRef.current) {
      epaperFileInputRef.current.value = '';
    }
  };

  const onImageSelected = (file?: File) => {
    if (!file || !editingArticle) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditingArticle({ ...editingArticle, imageUrl: String(reader.result || '') });
      toast.success('Image added');
    };
    reader.onerror = () => toast.error('Failed to read image');
    reader.readAsDataURL(file);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'homepage', label: 'Home Page', icon: Home },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'editor', label: 'Editor', icon: Edit },
    { id: 'breaking', label: 'Breaking', icon: Activity },
    { id: 'epaper', label: 'E-Paper', icon: BookOpenCheck },
    ...(currentUser?.role === 'admin' || currentUser?.role === 'editor' ? [{ id: 'youtube', label: 'Video News', icon: Play }] : []),
    ...(currentUser?.role === 'admin' ? [{ id: 'users', label: 'Users', icon: Users }] : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <RLink to="/">
                <h1 className="font-bold cursor-pointer">
                  <span className="text-red-600">NEWS</span>
                  <span className="text-gray-900 dark:text-white">4US</span>
                </h1>
              </RLink>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start ${activeTab === item.id ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </Button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 font-medium">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {currentUser?.role || 'admin'}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={`mt-3 ${sidebarOpen ? 'w-full justify-start' : 'w-full justify-center'} text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6 overflow-y-auto h-screen">
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="homepage" className="space-y-4">
              <HomePageEditor />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome back, {currentUser?.name || 'Administrator'}!</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-4 flex-shrink-0">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1"> {/* Added min-w-0 and flex-1 for proper text wrapping */}
                        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate"> {/* Added truncate */}
                          {articles.length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-normal"> {/* Changed to whitespace-normal */}
                          Total Articles
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 mr-4 flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1"> {/* Added min-w-0 and flex-1 for proper text wrapping */}
                        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate"> {/* Added truncate */}
                          34.5K
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-normal"> {/* Changed to whitespace-normal */}
                          Total Views
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-4 flex-shrink-0">
                        <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1"> {/* Added min-w-0 and flex-1 for proper text wrapping */}
                        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate"> {/* Added truncate */}
                          {articles.filter(a => a.status === 'published').length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-normal"> {/* Changed to whitespace-normal */}
                          Published
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4 flex-shrink-0">
                        <BarChart3 className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1"> {/* Added min-w-0 and flex-1 for proper text wrapping */}
                        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate"> {/* Added truncate */}
                          {articles.filter(a => a.status === 'draft').length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-normal"> {/* Changed to whitespace-normal */}
                          Drafts
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Weekly Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RResponsiveContainer width="100%" height={250}>
                      <RLineChart data={viewsData}>
                        <RCartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <RXAxis dataKey="name" />
                        <RYAxis />
                        <RTooltip />
                        <RLine type="monotone" dataKey="views" stroke="#ef4444" strokeWidth={2} />
                      </RLineChart>
                    </RResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Content by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RResponsiveContainer width="100%" height={250}>
                      <RPieChart>
                        <RPie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </RPie>
                        <RTooltip />
                      </RPieChart>
                    </RResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Content Management</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage all your articles and posts</p>
                </div>
                {(currentUser?.role === 'admin' || currentUser?.role === 'editor') && (
                  <Button onClick={handleCreateArticle} className="bg-red-600 hover:bg-red-700 whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-2" />
                    New Article
                  </Button>
                )}
              </div>

              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {articles.map((article) => (
                          <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{article.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{article.publishDate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline">{article.category}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(article.status || 'draft')}>{article.status}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {article.author}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {(article.views || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingArticle(article as any);
                                    setIsCreating(false);
                                    // setActiveTab('editor'); // Removed tab navigation
                                  }}
                                  className="p-2"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="p-2">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {(currentUser?.role === 'admin' || currentUser?.role === 'editor') && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteArticle(article.id)}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="editor" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Article Editor</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create and edit articles</p>
                </div>
                <Button onClick={handleSaveArticle} className="bg-red-600 hover:bg-red-700 whitespace-nowrap">
                  <Save className="w-4 h-4 mr-2" />
                  Save Article
                </Button>
              </div>

              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editingArticle?.title || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={editingArticle?.category || ''}
                        onValueChange={(value) => setEditingArticle({ ...editingArticle, category: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={editingArticle?.author || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="publishDate">Publish Date</Label>
                      <Input
                        id="publishDate"
                        type="date"
                        value={editingArticle?.publishDate || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, publishDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editingArticle?.status || ''}
                        onValueChange={(value) => setEditingArticle({ ...editingArticle, status: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="summary">Summary</Label>
                      <Textarea
                        id="summary"
                        value={editingArticle?.summary || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={editingArticle?.content || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Image</Label>
                      <div className="mt-1 space-y-2">
                        {editingArticle?.imageUrl && (
                          <div className="relative">
                            <img 
                              src={editingArticle.imageUrl} 
                              alt="Preview" 
                              className="w-32 h-32 object-cover rounded-md border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                              onClick={() => setEditingArticle({ ...editingArticle, imageUrl: '' })}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                        <Input
                          id="imageUrl"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setEditingArticle({ 
                                    ...editingArticle, 
                                    imageUrl: event.target.result as string 
                                  });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500">Upload an image from your device</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Select
                        value={editingArticle?.tags || []}
                        onValueChange={(value) => setEditingArticle({ ...editingArticle, tags: value })}
                        multiple
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select tags" />
                        </SelectTrigger>
                        <SelectContent>
                          {tags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="placements">Placements</Label>
                      <div className="mt-1">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="homeHero">Home Hero</Label>
                          <Switch
                            id="homeHero"
                            checked={editingArticle?.placements.homeHero || false}
                            onCheckedChange={(checked) => setEditingArticle({ ...editingArticle, placements: { ...editingArticle.placements, homeHero: checked } })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="homeSection">Home Section</Label>
                          <Select
                            value={editingArticle?.placements.homeSection || 'none'}
                            onValueChange={(value) => setEditingArticle({ ...editingArticle, placements: { ...editingArticle.placements, homeSection: value } })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="section1">Section 1</SelectItem>
                              <SelectItem value="section2">Section 2</SelectItem>
                              <SelectItem value="section3">Section 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="categorySpot">Category Spot</Label>
                          <Select
                            value={editingArticle?.placements.categorySpot || 'none'}
                            onValueChange={(value) => setEditingArticle({ ...editingArticle, placements: { ...editingArticle.placements, categorySpot: value } })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a spot" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="spot1">Spot 1</SelectItem>
                              <SelectItem value="spot2">Spot 2</SelectItem>
                              <SelectItem value="spot3">Spot 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breaking" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Breaking News</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage breaking news items</p>
                </div>
                <Button onClick={() => setEditingTickerIndex(null)} className="bg-red-600 hover:bg-red-700 whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  New Ticker
                </Button>
              </div>

              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tickerText">Ticker Text</Label>
                      <Input
                        id="tickerText"
                        value={editingTickerIndex !== null ? breakingItems[editingTickerIndex] : newTickerText}
                        onChange={(e) => {
                          if (editingTickerIndex !== null) {
                            const newItems = [...breakingItems];
                            newItems[editingTickerIndex] = e.target.value;
                            setBreakingItems(newItems);
                          } else {
                            setNewTickerText(e.target.value);
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tickerSpeed">Speed (ms)</Label>
                      <Input
                        id="tickerSpeed"
                        type="number"
                        value={breakingSpeedMs.toString()}
                        onChange={(e) => setBreakingSpeed(parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tickerPause">Pause on Hover</Label>
                      <Switch
                        id="tickerPause"
                        checked={breakingPauseOnHover}
                        onCheckedChange={setBreakingPause}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {breakingItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>{item}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTickerIndex(index)}
                            className="p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeBreakingItem(index)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="epaper" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">E-Papers</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage E-Papers</p>
                </div>
                <Button onClick={handleUploadEPaper} className="bg-red-600 hover:bg-red-700 whitespace-nowrap">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload E-Paper
                </Button>
              </div>

              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="epaperTitle">Title</Label>
                      <Input
                        id="epaperTitle"
                        value={newEpaperTitle}
                        onChange={(e) => setNewEpaperTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="epaperFile">File</Label>
                      <Input
                        id="epaperFile"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setNewEpaperFile(e.target.files[0]);
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {epapers.map((epaper) => (
                      <div key={epaper.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>{epaper.title}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{epaper.uploadDate}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteEPaper(epaper.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {(currentUser?.role === 'admin' || currentUser?.role === 'editor') && (
              <TabsContent value="youtube" className="space-y-4">
                <YouTubeVideosEditor />
              </TabsContent>
            )}

            {currentUser?.role === 'admin' && (
              <TabsContent value="users" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Users</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage users</p>
                  </div>
                  <Button className="bg-red-600 hover:bg-red-700 whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-2" />
                    New User
                  </Button>
                </div>

                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="userEmail">Email</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userName">Name</Label>
                        <Input
                          id="userName"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userRole">Role</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>user@example.com</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Admin</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>user@example.com</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Editor</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>user@example.com</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Viewer</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="settings" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure site settings</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 whitespace-nowrap">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>

              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="siteTitle">Site Title</Label>
                      <Input
                        id="siteTitle"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteLogo">Site Logo</Label>
                      <Input
                        id="siteLogo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            onImageSelected(e.target.files[0]);
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteTheme">Site Theme</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}