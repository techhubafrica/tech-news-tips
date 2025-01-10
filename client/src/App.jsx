import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Header from './components/Header';
import NewsList from './components/NewsList';
import TipsList from './components/TipsList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import AboutPage from './components/pages/AboutPage';

function App() {
  const [activeTab, setActiveTab] = useState('news');

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background text-foreground mt-20">
          <Header />
          <main className="container mx-auto py-6 px-4">
            <Routes>
              <Route
                path="/"
                element={
                  <Tabs defaultValue="news" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="news">News</TabsTrigger>
                      <TabsTrigger value="tips">Tips</TabsTrigger>
                    </TabsList>
                    <TabsContent value="news">
                      <NewsList />
                    </TabsContent>
                    <TabsContent value="tips">
                      <TipsList />
                    </TabsContent>
                  </Tabs>
                }
              />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
