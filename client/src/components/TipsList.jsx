import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import { Lightbulb, ChevronLeft, ChevronRight, Loader2, Calendar, Map, Globe } from 'lucide-react';

const TipsList = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalTips, setTotalTips] = useState(0);
  const [activeCategory, setActiveCategory] = useState('ghana');
  const itemsPerPage = 9; // 3x3 grid

  useEffect(() => {
    fetchTips(currentPage, activeCategory);
  }, [currentPage, activeCategory]);

  const fetchTips = async (page, category) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://tech-news-tips-erf3.onrender.com/api/tips/${category}?page=${page}&limit=${itemsPerPage}`
      );
      const data = await response.json();
      setTips(data.tips);
      setTotalPages(data.totalPages);
      setTotalTips(data.totalTips);
    } catch (err) {
      console.error('Error fetching tips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(newPage);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get category badge color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'ghana':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'africa':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'world':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="ghana" 
        value={activeCategory}
        onValueChange={handleCategoryChange}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto mb-6">
          <TabsTrigger value="ghana" className="flex items-center gap-2">
            <Map className="w-4 h-4" /> Ghana
          </TabsTrigger>
          <TabsTrigger value="africa" className="flex items-center gap-2">
            <Map className="w-4 h-4" /> Africa
          </TabsTrigger>
          <TabsTrigger value="world" className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> World
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tips.map((tip, index) => (
                <Card key={index} className="flex flex-col transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 text-emerald-700 dark:text-emerald-300">
                        {tip.title}
                      </CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(tip.category)}`}>
                        {tip.category}
                      </span>
                    </div>
                    <CardDescription className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm">
                        By {tip.author} • {tip.source}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3 h-3" />
                        {formatDate(tip.createdAt)}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="line-clamp-3 text-muted-foreground">
                      {tip.content}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full transition-colors bg-emerald-600 hover:bg-emerald-700" 
                      asChild
                    >
                      <a 
                        href={tip.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" /> Learn More
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between pt-4 space-y-2 border-t md:flex-row">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalTips)} of {totalTips} tips
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(currentPage - page) <= 1
                      );
                    })
                    .map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page 
                            ? "bg-emerald-600 hover:bg-emerald-700" 
                            : ""
                        }
                      >
                        {page}
                      </Button>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default TipsList;
