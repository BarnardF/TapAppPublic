interface TapCardProps {
  id: string;
  title: string;
  container_type?: string;
  material?: string;
  size?: string;
  flow_rate?: string;
  liquid_type?: string;
  description: string;
  image_url: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TapCard({ id,title,container_type,material,size,flow_rate,liquid_type,description,image_url,onEdit,onDelete, }: TapCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full h-56 bg-gray-200">
        <img
          src={image_url}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
        {/* Category Details */}
         <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-xs text-gray-700">
          {container_type && (
            <p><span className="font-medium text-gray-800">Container:</span> {container_type}</p>
          )}
          {material && (
            <p><span className="font-medium text-gray-800">Material:</span> {material}</p>
          )}
          {size && (
            <p><span className="font-medium text-gray-800">Size:</span> {size}</p>
          )}
          {flow_rate && (
            <p><span className="font-medium text-gray-800">Flow Rate:</span> {flow_rate}</p>
          )}
          {liquid_type && (
            <p><span className="font-medium text-gray-800">Liquid:</span> {liquid_type}</p>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <button
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            onClick={() => onEdit(id)}
          >
            Edit
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            onClick={() => onDelete(id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}