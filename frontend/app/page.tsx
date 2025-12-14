import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Survey MVP
        </h1>
        <p className="text-xl text-gray-600">
          Create, share, and analyze surveys with ease
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <Card>
          <h2 className="text-2xl font-semibold mb-3">Create Surveys</h2>
          <p className="text-gray-600 mb-4">
            Build custom surveys with multiple question types including single choice, multiple choice, text, and image uploads.
          </p>
          <Button>Get Started</Button>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold mb-3">Collect Responses</h2>
          <p className="text-gray-600 mb-4">
            Share your surveys via unique links and collect responses from your audience in real-time.
          </p>
          <Button variant="secondary">Learn More</Button>
        </Card>
      </div>
    </div>
  );
}
