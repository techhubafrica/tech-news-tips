import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { GitCommit, Newspaper, Lightbulb, RefreshCw, Shield, Globe } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-4">
          About Tech News & Tips
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your daily source for curated technology news and expert programming tips,
          bringing you the latest insights from the tech world.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Newspaper className="h-5 w-5" />
              Fresh Tech News
            </CardTitle>
          </CardHeader>
          <CardContent>
            Get the latest technology news from trusted sources, updated every 6 hours.
            Stay informed about industry trends, innovations, and breakthroughs.
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Lightbulb className="h-5 w-5" />
              Expert Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            Access programming tips and best practices from experienced developers
            across multiple platforms including Hashnode, DEV.to, and more.
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <RefreshCw className="h-5 w-5" />
              Regular Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            Content is automatically refreshed throughout the day to ensure
            you never miss important updates and the latest programming insights.
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Globe className="h-5 w-5" />
              Global Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            We aggregate content from multiple reliable sources to provide
            diverse perspectives and comprehensive coverage of the tech world.
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <GitCommit className="h-5 w-5" />
            Our Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We carefully curate content from trusted technology news outlets and developer communities:
          </p>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Technology News: News API - Top headlines from tech journalism</li>
            <li>Developer Tips: Hashnode - Community-driven technical content</li>
            <li>Programming Insights: DEV.to - Expert developer articles and tutorials</li>
            <li>Industry Updates: Various tech news sources and APIs</li>
          </ul>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <Shield className="h-5 w-5" />
            Privacy & Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We respect your privacy and the intellectual property of our sources:
          </p>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>No personal data collection or tracking</li>
            <li>All content is properly attributed to original sources</li>
            <li>Links direct to original articles and posts</li>
            <li>Regular updates to ensure content freshness</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;