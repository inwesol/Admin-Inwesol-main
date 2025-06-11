"use client"
import { useState, useEffect } from 'react';
import { Edit, ChevronRight, User, Mail, Briefcase, Phone, MapPin, Calendar, Users, Building, Save, X, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

// Type definitions
interface Coach {
  id: number;
  name?: string;
  [key: string]: any;
}

interface ExtendedBreadcrumbProps {
  coach: Coach | null;
  onDashboardClick: () => void;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  active: boolean;
  onClick: (value: string) => void;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  activeTab: string;
  children: React.ReactNode;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CoachDetailsPageProps {
  params: {
    id: string;
  };
}

interface CategorizedData {
  personal: Record<string, any>;
  professional: Record<string, any>;
  contact: Record<string, any>;
  qualifications: Record<string, any>;
  other: Record<string, any>;
}

// Extended Breadcrumb component
const ExtendedBreadcrumb = ({ coach, onDashboardClick }: ExtendedBreadcrumbProps) => (
  <div className=" px-4 py-3">
    <div className="max-w-7xl mx-auto">
      <nav className="flex items-center space-x-2 text-sm">
        <button 
          onClick={onDashboardClick}
          className="hover:underline"
        >
          Admin Portal
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <button 
          onClick={onDashboardClick}
          className="hover:underline"
        >
          Dashboard
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600">
          {coach ? coach.name || `Coach #${coach.id}` : 'Loading...'}
        </span>
      </nav>
    </div>
  </div>
);

// Tab component
const TabsList = ({ children }: TabsListProps) => (
  <div className="border-b border-gray-200 bg-white">
    <div className="flex overflow-x-auto">
      {children}
    </div>
  </div>
);

const TabsTrigger = ({ value, active, onClick, children }: TabsTriggerProps) => (
  <button
    onClick={() => onClick(value)}
    className={`px-6 py-4 text-sm md:text-base font-semibold whitespace-nowrap border-b-2 transition-colors ${
      active 
        ? "text-[#00B24B] border-[#00B24B] bg-green-50" 
        : "text-gray-600 border-transparent hover:text-[#00B24B] hover:border-gray-300"
    }`}
  >
    {children}
  </button>
);

const TabsContent = ({ value, activeTab, children }: TabsContentProps) => (
  <div className={activeTab === value ? "block" : "hidden"}>
    {children}
  </div>
);

// Card components
const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }: CardContentProps) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export default function CoachDetailsPage({ params }: CoachDetailsPageProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [coach, setCoach] = useState<Coach | null>(null);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  
  // Get the coach ID from the URL parameters
  const coachId = params?.id;
  
  // Get user-specific localStorage key for coaches
  const getUserStorageKey = (): string | null => {
    if (!user?.id) return null;
    return `coachData_${user.id}`;
  };
  
  // Load coach data from user-specific localStorage on initial mount
  useEffect(() => {
    const loadCoachData = () => {
      setLoading(true);
      try {
        if (user?.id) {
          const storageKey = getUserStorageKey();
          if (storageKey) {
            const storedCoaches = localStorage.getItem(storageKey);
            if (storedCoaches) {
              const coaches: Coach[] = JSON.parse(storedCoaches);
              const foundCoach = coaches.find(c => c.id === parseInt(coachId));
              
              if (foundCoach) {
                setCoach(foundCoach);
              } else {
                // Coach not found
                console.error("Coach not found with ID:", coachId);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading coach data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (coachId && isLoaded) {
      loadCoachData();
    }
  }, [coachId, user?.id, isLoaded]);
  
  // Function to go back to the coach manager
  const handleGoBack = () => {
    router.push('/');
  };
  
  // Function to handle editing
  const handleEditCoach = () => {
    if (coach) {
      setEditingCoach({ ...coach }); // Create a copy for editing
      setIsEditing(true);
    }
  };
  
  // Function to handle saving edits
  const handleSaveEdit = () => {
    if (!editingCoach || !user?.id) return;
    
    try {
      const storageKey = getUserStorageKey();
      if (storageKey) {
        const storedCoaches = localStorage.getItem(storageKey);
        if (storedCoaches) {
          const coaches: Coach[] = JSON.parse(storedCoaches);
          const updatedCoaches = coaches.map(c => 
            c.id === editingCoach.id ? editingCoach : c
          );
          localStorage.setItem(storageKey, JSON.stringify(updatedCoaches));
          setCoach(editingCoach);
          setIsEditing(false);
          setEditingCoach(null);
        }
      }
    } catch (error) {
      console.error("Error saving coach data:", error);
    }
  };
  
  // Function to handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCoach(null);
  };
  
  // Function to handle input changes
  const handleInputChange = (key: string, value: string) => {
    if (editingCoach) {
      setEditingCoach({
        ...editingCoach,
        [key]: value
      });
    }
  };
  
  // Categorize coach properties
  const categorizeProperties = (coach: Coach): CategorizedData => {
    if (!coach) return {
      personal: {},
      professional: {},
      contact: {},
      qualifications: {},
      other: {}
    };
    
    // Define categories with normalized keys for coaches
    const categoryMappings = {
      personal: {
        'name': ['name'],
        'dateOfBirth': ['dateofbirth', 'date of birth', 'dob'],
        'gender': ['gender'],
        'address': ['address']
      },
      professional: {
        'role': ['role', 'position', 'title', 'jobtitle'],
        'specialization': ['specialization', 'sport', 'specialty'],
        'experience': ['experience', 'years of experience'],
        'department': ['department'],
        'level': ['level', 'coaching level']
      },
      contact: {
        'email': ['email', 'email address'],
        'phone': ['phone', 'mobile', 'contactnumber', 'contact number'],
        'emergencyContact': ['emergencycontact', 'emergency contact'],
        'emergencyPhone': ['emergencyphone', 'emergency phone']
      },
      qualifications: {
        'certification': ['certification', 'certifications'],
        'education': ['education'],
        'degree': ['degree'],
        'training': ['training'],
        'qualifications': ['qualifications'],
        'licenses': ['licenses', 'license']
      }
    };
    
    // Initialize categorized data object
    const categorized: CategorizedData = {
      personal: {},
      professional: {},
      contact: {},
      qualifications: {},
      other: {}
    };
    
    // Track which keys have been processed to avoid duplicates
    const processedKeys = new Set<string>();
    
    // Categorize each property
    Object.entries(coach).forEach(([key, value]) => {
      // Skip ID and already processed keys
      if (key === 'id' || processedKeys.has(key.toLowerCase())) return;
      
      const keyLower = key.toLowerCase();
      let foundCategory: keyof CategorizedData | null = null;
      let normalizedKey: string | null = null;
      let foundVariations: string[] = [];
      
      // Find which category this key belongs to
      for (const [category, mappings] of Object.entries(categoryMappings)) {
        for (const [normalizedName, variations] of Object.entries(mappings)) {
          if (variations.includes(keyLower)) {
            foundCategory = category as keyof CategorizedData;
            normalizedKey = normalizedName;
            foundVariations = variations;
            break;
          }
        }
        if (foundCategory) break;
      }
      
      // If no specific category is found, put in "other"
      if (!foundCategory) {
        foundCategory = 'other';
        normalizedKey = key;
      }
      
      // Add to categorized data and mark as processed
      if (normalizedKey) {
        categorized[foundCategory][normalizedKey] = value;
        processedKeys.add(keyLower);
        
        // Also mark all variations as processed to prevent duplicates
        if (foundCategory !== 'other' && foundVariations.length > 0) {
          foundVariations.forEach((variation: string) => processedKeys.add(variation));
        }
      }
    });
    
    return categorized;
  };
  
  // Show loading state while Clerk is loading
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B24B] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view coach details.</p>
        </div>
      </div>
    );
  }
  
  // Show error if coach not found
  if (!coach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Coach Not Found</h2>
          <p className="text-gray-600">The coach you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }
  
  // Use editingCoach data when in edit mode, otherwise use coach data
  const displayCoach = isEditing ? editingCoach : coach;
  const categorizedData = categorizeProperties(displayCoach || coach);
  
  // Hide empty categories
  const nonEmptyCategories = Object.entries(categorizedData)
    .filter(([_, values]) => Object.keys(values).length > 0)
    .map(([category]) => category);
  
  const getCategoryLabel = (category: string): string => {
    switch(category) {
      case 'personal': return 'Personal Information';
      case 'professional': return 'Professional Details';
      case 'contact': return 'Contact Information';
      case 'qualifications': return 'Qualifications & Certifications';
      default: return 'Other Information';
    }
  };
  
  // Get icon for specific field
  const getFieldIcon = (field: string): React.ReactNode | null => {
    const fieldLower = field.toLowerCase();
    if (fieldLower.includes('email')) return <Mail className="w-4 h-4 text-[#3FA1D8]" />;
    if (fieldLower.includes('name')) return <User className="w-4 h-4 text-[#3FA1D8]" />;
    if (fieldLower.includes('role') || fieldLower.includes('position') || fieldLower.includes('specialization')) return <Briefcase className="w-4 h-4 text-[#3FA1D8]" />;
    if (fieldLower.includes('phone') || fieldLower.includes('contact')) return <Phone className="w-4 h-4 text-[#3FA1D8]" />;
    if (fieldLower.includes('address')) return <MapPin className="w-4 h-4 text-[#3FA1D8]" />;
    if (fieldLower.includes('date') || fieldLower.includes('birth')) return <Calendar className="w-4 h-4 text-[#3FA1D8]" />;
    if (fieldLower.includes('emergency')) return <Users className="w-4 h-4 text-[#3FA1D8]" />;
    if (fieldLower.includes('department') || fieldLower.includes('level')) return <Building className="w-4 h-4 text-[#3FA1D8]" />;
    if (fieldLower.includes('certification') || fieldLower.includes('qualification') || fieldLower.includes('education') || fieldLower.includes('training')) return <Award className="w-4 h-4 text-[#3FA1D8]" />;
    return null;
  };
  
  // Get display name for field
  const getDisplayName = (key: string): string => {
    const displayNames: Record<string, string> = {
      'name': 'Full Name',
      'email': 'Email Address',
      'phone': 'Phone Number',
      'dateOfBirth': 'Date of Birth',
      'gender': 'Gender',
      'address': 'Address',
      'role': 'Role/Position',
      'specialization': 'Specialization',
      'experience': 'Experience',
      'department': 'Department',
      'level': 'Coaching Level',
      'emergencyContact': 'Emergency Contact',
      'emergencyPhone': 'Emergency Phone',
      'certification': 'Certifications',
      'education': 'Education',
      'degree': 'Degree',
      'training': 'Training',
      'qualifications': 'Qualifications',
      'licenses': 'Licenses'
    };
    
    return displayNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };
  
  // Find the original key for a normalized key
  const findOriginalKey = (normalizedKey: string, category: keyof CategorizedData): string => {
    const originalCoach = isEditing ? coach : displayCoach;
    if (!originalCoach) return normalizedKey;
    
    // Look for the actual key in the original coach object
    const possibleKeys = Object.keys(originalCoach).filter(key => {
      const keyLower = key.toLowerCase();
      const normalizedLower = normalizedKey.toLowerCase();
      return keyLower === normalizedLower || 
             keyLower.replace(/\s+/g, '') === normalizedLower.replace(/\s+/g, '') ||
             keyLower.includes(normalizedLower) ||
             normalizedLower.includes(keyLower);
    });
    
    return possibleKeys[0] || normalizedKey;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Extended Breadcrumb Navigation */}
      <ExtendedBreadcrumb coach={coach} onDashboardClick={handleGoBack} />
      
      <div className="w-full mx-auto px-4 py-6">
        {/* Header with edit/save/cancel buttons */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Coach Details' : 'Coach Details'}
          </h1>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="inline-flex items-center px-4 py-2 bg-[#00B24B] text-white rounded-lg hover:bg-[#009640] transition-colors font-medium shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium shadow-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditCoach}
                className="inline-flex items-center px-4 py-2 bg-[#00B24B] text-white rounded-lg hover:bg-[#009640] transition-colors font-medium shadow-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
          </div>
        </div>
        
        {/* Full width content area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
          {/* Tabs */}
          <TabsList>
            {nonEmptyCategories.map(category => (
              <TabsTrigger
                key={category}
                value={category}
                active={activeTab === category}
                onClick={setActiveTab}
              >
                {getCategoryLabel(category)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Tab content */}
          <div className="p-6 flex-1 overflow-auto">
            {nonEmptyCategories.map(category => (
              <TabsContent key={category} value={category} activeTab={activeTab}>
                <div className="h-full">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(categorizedData[category as keyof CategorizedData]).map(([key, value]) => {
                      const originalKey = findOriginalKey(key, category as keyof CategorizedData);
                      
                      return (
                        <div key={key} className="border border-gray-100 rounded-lg p-4 hover:border-[#00B24B] transition-colors h-fit">
                          <div className="flex items-center gap-3 mb-2">
                            {getFieldIcon(key) && (
                              <div className="flex-shrink-0">
                                {getFieldIcon(key)}
                              </div>
                            )}
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {getDisplayName(key)}
                            </h3>
                          </div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingCoach?.[originalKey]?.toString() || ''}
                              onChange={(e) => handleInputChange(originalKey, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B24B] focus:border-transparent"
                              placeholder={`Enter ${getDisplayName(key).toLowerCase()}`}
                            />
                          ) : (
                            <p className="text-gray-700 break-words">
                              {value?.toString() || '-'}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}