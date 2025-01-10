import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Lightbulb, ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';

const TipsList = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalTips, setTotalTips] = useState(0);
  const itemsPerPage = 9; // 3x3 grid

  useEffect(() => {
    fetchTips(currentPage);
  }, [currentPage]);

  const fetchTips = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`https://tech-news-exf0.onrender.com/api/tips?page=${page}&limit=${itemsPerPage}`);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip, index) => (
              <Card key={index} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-emerald-700 dark:text-emerald-300">
                    {tip.title}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      By {tip.author} • {tip.source}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors" 
                    asChild
                  >
                    <a 
                      href={tip.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <Lightbulb className="mr-2 h-4 w-4" /> Learn More
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t pt-4 space-y-2">
            <div className="text-sm text-muted-foreground ">
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
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(currentPage - page) <= 1
                    );
                  })
                  .map((page) => (
                    <>
                     
                      <Button
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
                    </>
                  ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TipsList;