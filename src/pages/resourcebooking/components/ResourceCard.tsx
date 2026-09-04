import {
  Building2,
  Car,
  Package,
  MapPin,
} from 'lucide-react';

interface ResourceCardProps {
  resource: {
    id: number;
    name: string;
    type: string;
    location?: string;
    capacity?: number | null;
    description?: string;
  };

  onBook: () => void;
}

const ResourceCard = ({
  resource,
  onBook,
}: ResourceCardProps) => {

  const getIcon = () => {
    switch (resource.type.toLowerCase()) {
      case 'room':
        return Building2;

      case 'vehicle':
        return Car;

      default:
        return Package;
    }
  };

  const Icon = getIcon();

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
          {resource.type}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">
          {resource.name}
        </h3>

        {resource.location && (
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {resource.location}
          </div>
        )}

        {resource.capacity && (
          <p className="mt-2 text-sm text-muted-foreground">
            Capacity: {resource.capacity}
          </p>
        )}

        {resource.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {resource.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onBook}
        className="mt-5 w-full rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
      >
        Book Now
      </button>
    </div>
  );
};

export default ResourceCard;
