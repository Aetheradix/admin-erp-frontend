import { useState } from 'react';
import { Button } from '../components/ui/primitives/Button';
import { Input } from '../components/ui/primitives/Input';
import { Textarea } from '../components/ui/primitives/Textarea';
import { Checkbox } from '../components/ui/primitives/Checkbox';
import { Radio } from '../components/ui/primitives/Radio';
import { Switch } from '../components/ui/primitives/Switch';
import { Badge } from '../components/ui/primitives/Badge';
import { Avatar } from '../components/ui/primitives/Avatar';
import { Spinner } from '../components/ui/primitives/Spinner';
import { Divider } from '../components/ui/primitives/Divider';
import { FormField } from '../components/ui/composed/FormField';
import { SearchBar } from '../components/ui/composed/SearchBar';
import { PageHeader } from '../components/ui/composed/PageHeader';
import { EmptyState } from '../components/ui/composed/EmptyState';
import { DataTable } from '../components/ui/composed/DataTable';
import { Column } from 'primereact/column';

const ComponentLibrary = () => {
  const [searchValue, setSearchValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);

  const tableData = [
    { id: 1, name: 'Apple MacBook Pro', category: 'Electronics', price: '$1999' },
    { id: 2, name: 'Designer Jeans', category: 'Clothing', price: '$49' },
    { id: 3, name: 'Coffee Maker', category: 'Kitchen', price: '$89' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <PageHeader 
        title="UI Component Library" 
        subtitle="A showcase of all primitive and composed components."
        actions={<Button label="Export Theme" variant="outline" icon="pi pi-download" />}
      />

      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">Primitives</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Buttons */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted">Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <Button label="Primary" variant="primary" />
              <Button label="Secondary" variant="secondary" />
              <Button label="Outline" variant="outline" />
              <Button label="Danger" variant="danger" />
              <Button label="Ghost" variant="ghost" />
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted">Form Inputs</h3>
            <Input placeholder="Standard Input" />
            <Textarea placeholder="Textarea / Message" />
          </div>

          {/* Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted">Selection</h3>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Checkbox inputId="cb1" checked={checked} onChange={e => setChecked(e.checked || false)} />
                    <label htmlFor="cb1">Checkbox</label>
                </div>
                <div className="flex items-center gap-2">
                    <Switch checked={switchValue} onChange={e => setSwitchValue(e.value)} />
                    <label>Switch</label>
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <Radio inputId="r1" name="demo" value="1" checked={radioValue === '1'} onChange={e => setRadioValue(e.value)} />
                    <label htmlFor="r1">Option A</label>
                </div>
                <div className="flex items-center gap-2">
                    <Radio inputId="r2" name="demo" value="2" checked={radioValue === '2'} onChange={e => setRadioValue(e.value)} />
                    <label htmlFor="r2">Option B</label>
                </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted">Indicators</h3>
            <div className="flex items-center gap-3">
              <Badge value="New" variant="primary" />
              <Badge value="Success" variant="success" />
              <Badge value="Alert" variant="danger" />
              <Spinner size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <Avatar label="JD" size="large" />
              <Avatar icon="pi pi-user" size="large" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">Composed Components</h2>
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField label="Full Name" help="Enter your first and last name" error="">
              <Input placeholder="John Doe" />
            </FormField>
            <FormField label="Email Address" error="Please enter a valid email">
              <Input placeholder="john@example.com" className="p-invalid" />
            </FormField>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted">Search Bar</h3>
            <SearchBar value={searchValue} onChange={e => setSearchValue(e.target.value)} onSearch={v => console.log('Search:', v)} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted">Data Table</h3>
            <DataTable value={tableData}>
              <Column field="id" header="ID" />
              <Column field="name" header="Product Name" />
              <Column field="category" header="Category" />
              <Column field="price" header="Price" />
            </DataTable>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted">Empty State</h3>
            <EmptyState 
              title="No data found" 
              description="You haven't added any products yet. Click the button below to get started."
              action={{ label: 'Add Product', onClick: () => alert('Add product clicked') }}
            />
          </div>
        </div>
      </section>

      <Divider />
    </div>
  );
};

export default ComponentLibrary;
