import React from 'react';

const BuggyComponent: React.FC = () => {
  // This will throw an error when the component renders
  throw new Error("Deliberate error for testing error boundaries");
  return <div>This text won't render.</div>;
};

export default BuggyComponent;
