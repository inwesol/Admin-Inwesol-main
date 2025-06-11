"use client"
import { useState, useEffect, useCallback, useRef } from 'react';
import { PlusCircle, Trash2, Edit, Save, X, Upload, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs'; // Import Clerk's useUser hook
// Define types for TypeScript
interface Coach {
  id: number;
  name: string;
  email: string;
  role: string;
  [key: string]: any; // For any additional properties from Excel
}
interface NewCoach {
  name: string;
  email: string;
  role: string;
}
// Props interface for AnimatingPlaceholderInput
interface AnimatingPlaceholderInputProps {
  placeholders: string[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}
// Placeholder component similar to the one referenced in the example
const AnimatingPlaceholderInput: React.FC<AnimatingPlaceholderInputProps> = ({ 
  placeholders, 
  onChange, 
  onSubmit 
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState<number>(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders]);
  
  return (
    <div className="relative">
      <input
        type="text"
        className="w-full p-2 border-2 border-gray-200 rounded-md pl-10 focus:border-[#3FA1D8] focus:outline-none focus:ring-2 focus:ring-[#3FA1D8]/20 transition-all"
        placeholder={placeholders[placeholderIndex]}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit();
          }
        }}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3FA1D8]" size={16} />
    </div>
  );
};
export default function CoachListManager() {
  const router = useRouter();
  const { user, isLoaded } = useUser(); // Get current user from Clerk
  
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [newCoach, setNewCoach] = useState<NewCoach>({ name: '', email: '', role: '' });
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  
  // Pagination state
  const [displayedCoaches, setDisplayedCoaches] = useState<Coach[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const itemsPerPage = 20; // Number of items to load per page
  
  // Intersection Observer ref for infinite scroll
  const observerRef = useRef<HTMLDivElement>(null);
  
  // Get user-specific localStorage key
  const getUserStorageKey = (): string | null => {
    if (!user?.id) return null;
    return `coachData_${user.id}`;
  };
  
  // Store coaches data in user-specific localStorage
  useEffect(() => {
    if (coaches.length > 0 && user?.id) {
      const storageKey = getUserStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(coaches));
      }
    }
  }, [coaches, user?.id]);
  
  // Load coaches data from user-specific localStorage on initial mount
  useEffect(() => {
    if (isLoaded && user?.id) {
      const storageKey = getUserStorageKey();
      if (storageKey) {
        const storedCoaches = localStorage.getItem(storageKey);
        if (storedCoaches) {
          try {
            setCoaches(JSON.parse(storedCoaches));
          } catch (e) {
            console.error('Error parsing stored coaches data', e);
          }
        }
      }
    }
  }, [isLoaded, user?.id]);
  
  // Clear data when user changes (additional safety measure)
  useEffect(() => {
    if (isLoaded) {
      // Reset coaches state when user changes or is not authenticated
      if (!user?.id) {
        setCoaches([]);
      }
    }
  }, [user?.id, isLoaded]);
  
  // Get unique roles for filtering
  const roles: string[] = ['All', ...Array.from(new Set(coaches.map(coach => coach.role)))].filter(Boolean);
  
  // Update filtered coaches when search or filters change
  const updateFilteredCoaches = useCallback(() => {
    const filtered = coaches.filter(coach => {
      const matchesSearch = 
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'All' || coach.role === selectedRole;
      return matchesSearch && matchesRole;
    });
    setFilteredCoaches(filtered);
    // Reset pagination when filters change
    setCurrentPage(1);
    setHasMore(true);
  }, [searchQuery, selectedRole, coaches]);
  
  // Apply debounced filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilteredCoaches();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [updateFilteredCoaches]);
  
  // Initialize filtered coaches with all coaches
  useEffect(() => {
    setFilteredCoaches(coaches);
  }, [coaches]);
  
  // Load more items for pagination
  const loadMoreItems = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate loading delay (remove in production if not needed)
    setTimeout(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newItems = filteredCoaches.slice(startIndex, endIndex);
      
      if (newItems.length > 0) {
        setDisplayedCoaches(prev => [...prev, ...newItems]);
        setCurrentPage(prev => prev + 1);
      }
      
      setHasMore(endIndex < filteredCoaches.length);
      setIsLoading(false);
    }, 300);
  }, [currentPage, filteredCoaches, isLoading, hasMore, itemsPerPage]);
  
  // Reset displayed coaches when filtered coaches change
  useEffect(() => {
    setDisplayedCoaches([]);
    setCurrentPage(1);
    setHasMore(true);
    
    // Load initial items directly without calling loadMoreItems to avoid dependency loop
    if (filteredCoaches.length > 0) {
      const initialItems = filteredCoaches.slice(0, itemsPerPage);
      setDisplayedCoaches(initialItems);
      setHasMore(filteredCoaches.length > itemsPerPage);
      setCurrentPage(2); // Set to 2 since we've loaded the first page
    }
  }, [filteredCoaches, itemsPerPage]);
  
// Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );
    
    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, loadMoreItems]); // Added loadMoreItems back to dependencies
  
  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3FA1D8]"></div>
        <span className="ml-2 text-gray-700">Loading...</span>
      </div>
    );
  }
  
  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Authentication Required</h2>
        <p className="text-gray-600">Please sign in to manage your coach list.</p>
      </div>
    );
  }
  
  // Function to handle sample file download
  const handleSampleDownload = async (): Promise<void> => {
    try {
      // Create a sample Excel file dynamically using SheetJS
      // Sample data structure with expanded information
      const sampleData = [
        { 
          Name: "Coach 1", 
          Email: "coach1@example.com", 
          Role: "Head Coach", 
          Address: "1 Example Street, City, Country", 
          "Contact Number": "+91-9000000000", 
          "Emergency Contact": "Emergency Contact 1", 
          "Emergency Phone": "+91-8000000000", 
          "Date of Birth": "1990-01-15", 
          Specialization: "Basketball", 
          Experience: "5 years",
          Certification: "Level 2 Coach"
        },
        { 
          Name: "Coach 2", 
          Email: "coach2@example.com", 
          Role: "Assistant Coach", 
          Address: "2 Example Street, City, Country", 
          "Contact Number": "+91-9000000001", 
          "Emergency Contact": "Emergency Contact 2", 
          "Emergency Phone": "+91-8000000001", 
          "Date of Birth": "1991-02-15", 
          Specialization: "Football", 
          Experience: "3 years",
          Certification: "Level 1 Coach"
        }
      ];
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert the data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Coaches");
      
      // Generate binary data
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Create a Blob from the buffer with the correct MIME type
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Sample-coaches-input.xlsx';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error creating sample file:', error);
      alert('Error creating the sample file. Please try again later.');
    }
  };
  
  // Function to handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) return;
        // Process Excel file using SheetJS
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        // Get the first worksheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // Map to our Coach interface
        const importedCoaches: Coach[] = jsonData.map((row: any) => {
          return {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: row.name || row.Name || '',
            email: row.email || row.Email || '',
            role: row.role || row.Role || '',
            ...row // Keep any additional fields
          };
        });
        
        // Add the imported coaches to the state
        setCoaches(current => [...importedCoaches, ...current]);
        // Clear the file input
        event.target.value = '';
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing the Excel file. Please try a different file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  // Function to handle adding a new coach
  const handleAddCoach = (): void => {
    if (!newCoach.name.trim()) return;
    
    const coachWithId: Coach = {
      id: Date.now(),
      ...newCoach
    };
    
    // Add new coach at the top of the list
    setCoaches([coachWithId, ...coaches]);
    setNewCoach({ name: '', email: '', role: '' });
    setIsDialogOpen(false);
  };
  
  // Function to handle deleting a coach
  const handleDeleteCoach = (id: number): void => {
    setCoaches(coaches.filter(coach => coach.id !== id));
  };
  
  // Function to handle editing a coach
  const handleEditCoach = (coach: Coach): void => {
    setEditingCoach(coach);
    setIsEditDialogOpen(true);
  };
  
  // Function to handle clicking on a coach - navigate to details page
  const handleCoachClick = (coach: Coach): void => {
    // Navigate to coach details page with the coach's ID
    router.push(`/person-coach/${coach.id}`);
  };
  
  // Function to save edited coach
  const handleSaveEdit = (): void => {
    if (!editingCoach || !editingCoach.name.trim()) return;
    
    setCoaches(coaches.map(coach => 
      coach.id === editingCoach.id ? editingCoach : coach
    ));
    setEditingCoach(null);
    setIsEditDialogOpen(false);
  };
  
  // Function to handle field change in editing mode
  const handleEditFieldChange = (key: string, value: any): void => {
    if (!editingCoach) return;
    setEditingCoach({
      ...editingCoach,
      [key]: value
    });
  };
  
  return (
    <div className="flex flex-col space-y-4 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Coach Manager</h2>
          <p className="text-sm text-[#00B24B] font-medium">Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}</p>
          {filteredCoaches.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {filteredCoaches.length} coaches
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <button
              className="px-3 py-1 border-2 border-[#00B24B] text-[#00B24B] rounded text-sm flex items-center gap-1 hover:bg-[#00B24B] hover:text-white transition-all"
              onClick={handleSampleDownload}
            >
              <Download size={16} />
              Sample Download
            </button>
          </div>
          <div className="relative">
            <button
              className="px-3 py-1 border-2 border-[#3FA1D8] text-[#3FA1D8] rounded text-sm flex items-center gap-1 hover:bg-[#3FA1D8] hover:text-white transition-all"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload size={16} />
              Upload Excel
            </button>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <div className="relative inline-block">
            <button 
              className="bg-[#00B24B] text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-[#00B24B]/90 transition-all shadow-md"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusCircle size={16} />
              Add Coach
            </button>
            {isDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Add New Coach</h3>
                    <button onClick={() => setIsDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                      <input
                        id="name"
                        className="border-2 border-gray-200 rounded p-2 focus:border-[#3FA1D8] focus:outline-none focus:ring-2 focus:ring-[#3FA1D8]/20 transition-all"
                        value={newCoach.name}
                        onChange={(e) => setNewCoach({...newCoach, name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                      <input
                        id="email"
                        className="border-2 border-gray-200 rounded p-2 focus:border-[#3FA1D8] focus:outline-none focus:ring-2 focus:ring-[#3FA1D8]/20 transition-all"
                        value={newCoach.email}
                        onChange={(e) => setNewCoach({...newCoach, email: e.target.value})}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
                      <input
                        id="role"
                        className="border-2 border-gray-200 rounded p-2 focus:border-[#3FA1D8] focus:outline-none focus:ring-2 focus:ring-[#3FA1D8]/20 transition-all"
                        value={newCoach.role}
                        onChange={(e) => setNewCoach({...newCoach, role: e.target.value})}
                        placeholder="Head Coach"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button 
                      className="px-3 py-1 border-2 border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-all"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="bg-[#00B24B] text-white px-3 py-1 rounded hover:bg-[#00B24B]/90 transition-all"
                      onClick={handleAddCoach}
                    >
                      Add Coach
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="mt-4 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <AnimatingPlaceholderInput
              placeholders={[
                "Search by name...",
                "Search by email...",
                "Search by role...",
                "Find coaches...",
                "Look up trainers..."
              ]}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={() => {}}
            />
          </div>
          {coaches.length > 0 && (
            <div className="w-full md:w-48">
              <select
                className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-[#3FA1D8] focus:outline-none focus:ring-2 focus:ring-[#3FA1D8]/20 transition-all"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role || 'Unspecified'}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Coach Dialog */}
      {isEditDialogOpen && editingCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Edit Coach</h3>
              <button onClick={() => setIsEditDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 py-4">
              {/* Display all fields from the coach object, including dynamically imported ones */}
              {Object.entries(editingCoach)
                .filter(([key]) => key !== 'id') // Exclude ID from editing
                .sort(([keyA], [keyB]) => {
                  // Ensure name, email, and role appear first in that order
                  const order: Record<string, number> = {name: 0, email: 1, role: 2};
                  const orderA = order[keyA] !== undefined ? order[keyA] : Infinity;
                  const orderB = order[keyB] !== undefined ? order[keyB] : Infinity;
                  return orderA - orderB;
                })
                .map(([key, value]) => (
                  <div key={key} className="grid gap-2">
                    <label htmlFor={`edit-${key}`} className="text-sm font-medium capitalize text-gray-700">
                      {key}
                    </label>
                    <input
                      id={`edit-${key}`}
                      className="border-2 border-gray-200 rounded p-2 focus:border-[#3FA1D8] focus:outline-none focus:ring-2 focus:ring-[#3FA1D8]/20 transition-all"
                      value={value?.toString() || ''}
                      onChange={(e) => handleEditFieldChange(key, e.target.value)}
                    />
                  </div>
                ))
              }
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button 
                className="px-3 py-1 border-2 border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-all"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-[#00B24B] text-white px-3 py-1 rounded hover:bg-[#00B24B]/90 transition-all"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Coaches List */}
      <div className="grid grid-cols-1 gap-4">
        {displayedCoaches.length > 0 ? (
          <>
            {displayedCoaches.map((coach) => (
              <div 
                key={coach.id} 
                className="relative border-2 border-gray-200 rounded-lg w-full h-16 flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-[#3FA1D8]/5 hover:to-[#00B24B]/5 hover:border-[#3FA1D8] transition-all shadow-sm hover:shadow-md"
                onClick={() => handleCoachClick(coach)}
              >
                <div className="p-4 w-full">
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex space-x-1">
                    <button
                      className="h-8 w-8 text-[#3FA1D8] hover:text-[#3FA1D8]/80 hover:bg-[#3FA1D8]/10 rounded transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCoach(coach);
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCoach(coach.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium text-gray-800">{coach.name}</h3>
                      <div className="flex gap-2">
                        <p className="text-gray-500 text-sm">{coach.email}</p>
                        {coach.role && (
                          <span className="bg-gradient-to-r from-[#3FA1D8] to-[#00B24B] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            {coach.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator and intersection observer target */}
            {hasMore && (
              <div 
                ref={observerRef}
                className="flex items-center justify-center p-4"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#3FA1D8]"></div>
                    <span className="text-gray-500">Loading more...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadMoreItems}
                    className="px-4 py-2 text-[#3FA1D8] hover:text-[#00B24B] hover:bg-gradient-to-r hover:from-[#3FA1D8]/10 hover:to-[#00B24B]/10 rounded-md transition-all border border-[#3FA1D8] hover:border-[#00B24B]"
                  >
                    Load more coaches
                  </button>
                )}
              </div>
            )}
            
            {/* End of list indicator */}
            {!hasMore && displayedCoaches.length > itemsPerPage && (
              <div className="flex items-center justify-center p-4 text-gray-500 text-sm">
                You've reached the end of the list
              </div>
            )}
          </>
        ) : searchQuery || selectedRole !== 'All' ? (
          <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No coaches found matching your search</p>
            <button 
              className="px-3 py-1 border-2 border-[#3FA1D8] text-[#3FA1D8] rounded text-sm hover:bg-[#3FA1D8] hover:text-white transition-all"
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('All');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No coaches added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}