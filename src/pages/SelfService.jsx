import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const SelfService = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Self-Service Portal</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Find answers to common questions and issues.</p>
            <Link to="/app/knowledge-base" className="text-blue-500 hover:underline">
              Go to Knowledge Base
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Submit a Request</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create a new support request.</p>
            <Link to="/app/requests/new" className="text-blue-500 hover:underline">
              Create Request
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and track your support requests.</p>
            <Link to="/app/requests" className="text-blue-500 hover:underline">
              View My Tickets
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelfService;
