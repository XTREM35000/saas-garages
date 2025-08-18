import React from 'react';
import { ClientsCRUD } from '@/components/CRUD/ClientsCRUD';

const Clients: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <ClientsCRUD />
    </div>
  );
};

export default Clients;