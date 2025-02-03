import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Header from './components/Header';
import NewsList from './components/NewsList';
import TipsList from './components/TipsList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import AboutPage from '/components/pages/AboutPage';

function App() {
  // State to manage the active tab (not strictly necessary here, but allows for further functionality)
  const [activeTab, setActiveTab] = useState('news');

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <>
        <div className="min-h-screen mt-20 bg-background text-foreground">
          {/* Header Component */}
          <Header />

          <main className="container px-4 py-6 mx-auto">
            <Routes>
              {/* Home Route with Tabs */}
              <Route
                path="/"
                element={
                  <Tabs
                    defaultValue="news"
                    onValueChange={setActiveTab} // Updates active tab in state
                    className=""
                  >
                    {/* Tab Triggers */}
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="news">News</TabsTrigger>
                      <TabsTrigger value="tips">Tips</TabsTrigger>
                    </TabsList>

                    {/* Tab Contents */}
                    <TabsContent value="news">
                      <NewsList />
                    </TabsContent>
                    <TabsContent value="tips">
                      <TipsList />
                    </TabsContent>
                  </Tabs>
                }
              />

              {/* About Page Route */}
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
        </div>
      </>
    </ThemeProvider>
  );
}

export default App;
