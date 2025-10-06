import React from 'react';

const ApiDocs = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">API Documentation</h1>
      <div className="border rounded-lg overflow-hidden" style={{ height: '80vh' }}>
        <iframe
          title="Swagger UI"
          src="/api/schema/swagger-ui/"
          style={{ width: '100%', height: '100%', border: '0' }}
        />
      </div>
    </div>
  );
};

export default ApiDocs;
