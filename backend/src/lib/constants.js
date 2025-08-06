// backend/src/lib/constants.js

// This file contains the service hierarchy, mirroring the frontend but without
// the UI-specific properties like icons and colors.
// It's used by the service controller to provide category data.

export const serviceHierarchy = [
    { name: "Appliance Repair", query: "appliance-repair", subcategories: [
        { name: "AC", query: "ac" },
        { name: "Washing Machine", query: "washing-machine" },
        { name: "Television", query: "television" },
        { name: "Laptop", query: "laptop" },
        { name: "Air Cooler", query: "air-cooler" },
        { name: "Geyser", query: "geyser" },
        { name: "Water Purifier", query: "water-purifier" },
        { name: "Refrigerator", query: "refrigerator" },
        { name: "Stove & Hob", query: "stove-hob" },
        { name: "Microwave", query: "microwave" },
        { name: "Chimney", query: "chimney" }
    ]},
    { name: "Carpentry (Wooden Services)", query: "carpentry", subcategories: [
        { name: "Wooden Door", query: "wooden-door" },
        { name: "Wooden Window", query: "wooden-window" },
        { name: "Wooden Almirah", query: "wooden-almirah" },
        { name: "Wooden Showcase", query: "wooden-showcase" },
        { name: "Bed, chair, table, tool, bench", query: "furniture-work" }
    ]},
    { name: "Catering Services", query: "catering-services", subcategories: []},
    { name: "Civil Services", query: "civil-services", subcategories: [
        { name: "Builder", query: "builder" },
        { name: "Brickwork(with Sand, Cement, Plaster)", query: "brickwork" },
        { name: "Putty", query: "putty" },
        { name: "Tiles Fitting", query: "tiles-fitting" },
        { name: "Marble Setting", query: "marble-setting" },
    ]},
    { name: "Cleaner", query: "cleaner", subcategories: [
        { name: "Bathroom Cleaner", query: "bathroom-cleaner" },
        { name: "Full Home Cleaner", query: "full-home-cleaner" },
        { name: "Garden Cleaner", query: "garden-cleaner" },
        { name: "Sofa & Carpet Cleaner", query: "sofa-carpet-cleaner" }
    ]},
    { name: "Cook", query: "cook", subcategories: [] },
    { name: "Decorator Services", query: "decorator-services", subcategories: [
        { name: "Wedding Decoration", query: "wedding-decoration" },
        { name: "Puja Decoration", query: "puja-decoration" },
        { name: "Festival Decoration", query: "festival-decoration" },
        { name: "Birthday Decoration", query: "birthday-decoration" },
        { name: "Other Events", query: "other-events" }
    ]},
    { name: "Design", query: "design", subcategories: [
        { name: "Puja", query: "puja" },
        { name: "Birthday Party", query: "birthday-party" },
        { name: "Marriage Ceremony", query: "marriage-ceremony" },
        { name: "Festival", query: "festival" },
        { name: "Special Occasion", query: "special-occasion" }
    ]},
    { name: "Education", query: "education", subcategories: [
        { name: "General Teaching", query: "general-teaching" },
        { name: "Nursery kids", query: "nursery-kids" },
        { name: "Math", query: "math" },
        { name: "Physics", query: "physics" },
        { name: "Chemistry", query: "chemistry" },
        { name: "English", query: "english" },
        { name: "History", query: "history" },
        { name: "Geography", query: "geography" },
        { name: "Yoga", query: "yoga" },
        { name: "Dance", query: "dance" },
        { name: "Singing", query: "singing" },
    ]},
    { name: "Electrical", query: "electrical", subcategories: [] },
    { name: "Healthcare", query: "healthcare", subcategories: [
        { name: "General Physician", query: "general-physician" },
        { name: "Psychiatrist", query: "psychiatrist" },
        { name: "Pediatrician", query: "pediatrician" },
        { name: "Physiotherapist", query: "physiotherapist" }
    ]},
    { name: "Painting", query: "painting", subcategories: [] },
    { name: "Plumbing", query: "plumbing", subcategories: [] },
    { name: "Saloon", query: "saloon", subcategories: []},
    { name: "Transport Service", query: "transport-service", subcategories: [] },
    { name: "Welding Services", query: "welding-services", subcategories: [
        { name: "Sliding Window", query: "sliding-window" },
        { name: "Grill Door", query: "grill-door" },
        { name: "Iron/Steel Door", query: "iron-steel-door" },
        { name: "Iron/Steel Window", query: "iron-steel-window" },
        { name: "Stair Railing Cover", query: "stair-railing-cover" }
    ]},
].sort((a, b) => a.name.localeCompare(b.name));