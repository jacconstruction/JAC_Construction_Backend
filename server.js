require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Disable buffering so queries fail fast if not connected
mongoose.set('bufferCommands', false);

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of hanging
  })
    .then(() => console.log('Successfully connected to MongoDB.'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
} else {
  console.warn('MONGODB_URI is not defined in environment variables. Running in local backup mode.');
}


// Define Inquiry Schema & Model
const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  details: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// In-memory data mimicking a database (can also be loaded from files)
const servicesData = [
  {
    id: "structural",
    label: "TRUSTED CONSTRUCTION",
    title: "STRUCTURAL CONSTRUCTION",
    description: "From residential homes to commercial buildings, we deliver complete structural construction solutions with engineering precision, durable materials, and quality workmanship built to last for generations.",
    list: [
      "Residential & Commercial Construction",
      "RCC Framing & Concrete Works",
      "Column, Beam & Slab Execution",
      "Site Supervision & Quality Assurance"
    ],
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "masonry",
    label: "QUALITY WORKMANSHIP",
    title: "BRICK & BLOCK MASONRY",
    description: "Precision brickwork and block masonry solutions designed for strength, durability, and clean finishing. Our experienced team ensures accurate alignment and long-lasting structural integrity.",
    list: [
      "Solid Block & Red Brick Masonry",
      "Plastering & Wall Finishing",
      "Partition & Compound Walls",
      "Structural Reinforcement Support"
    ],
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "interior",
    label: "MODERN INTERIORS",
    title: "INTERIOR FINISHING",
    description: "Elegant interior solutions crafted with premium materials and modern design aesthetics. We create stylish, functional spaces tailored to your lifestyle and comfort.",
    list: [
      "False Ceiling & Lighting Design",
      "Premium Tiles & Flooring",
      "Modular Kitchen Installation",
      "Wall Painting & Texture Finishes"
    ],
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "renovation",
    label: "PROPERTY UPGRADE",
    title: "HOME RENOVATION",
    description: "Transform your existing property with modern renovation solutions that improve appearance, functionality, and long-term property value while maintaining structural safety.",
    list: [
      "House Remodeling & Extensions",
      "Exterior Elevation Upgrades",
      "Space Optimization Planning",
      "Structural Repair & Strengthening"
    ],
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "systems",
    label: "SAFE & RELIABLE SYSTEMS",
    title: "PLUMBING & ELECTRICAL",
    description: "Professional plumbing and electrical installations designed for safety, efficiency, and long-term performance using high-quality materials and certified workmanship.",
    list: [
      "Concealed Electrical Wiring",
      "Complete Plumbing Solutions",
      "Water Tank & Drainage Systems",
      "Smart Home & Backup Power Setup"
    ],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "architectural",
    label: "SMART PLANNING",
    title: "ARCHITECTURAL DESIGN",
    description: "Innovative architectural planning and 3D visualization services that help bring your dream project to life with practical layouts and modern design concepts.",
    list: [
      "2D Floor Plans & Blueprints",
      "3D Exterior & Interior Designs",
      "Vastu-Based Space Planning",
      "Building Approval Assistance"
    ],
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop"
  }
];

const projectsData = [
  {
    id: "01",
    title: "GREEN VALLEY VILLA",
    category: "Luxury Villa Construction",
    location: "Erode, Tamil Nadu",
    client: "Private Residential Group",
    duration: "18 Months",
    status: "Completed",
    budget: "₹1.5 Crores",
    description: "A premium independent villa project built with modern elevation design, spacious interiors, RCC structural strength, and high-end finishing.",
    fullDescription: "Green Valley Villa is a flagship residential project that exemplifies modern architectural elegance. Spanning over 4,500 sq.ft., this independent villa features an advanced RCC structural framework designed for maximum seismic resistance. The project includes premium Italian marble flooring, a custom modular kitchen with high-end appliances, and a sustainable rainwater harvesting system integrated into the landscaping.",
    image: "/projects/green_valley_villa.png",
    gallery: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "02",
    title: "SRI BUSINESS CENTER",
    category: "Commercial Building",
    location: "Perundurai, Erode",
    client: "Sri Commercial Holdings",
    duration: "24 Months",
    status: "Completed",
    budget: "₹4.2 Crores",
    description: "A multi-floor commercial complex designed for offices and retail spaces with modern architecture and durable structural engineering.",
    fullDescription: "The Sri Business Center is a landmark commercial development in the industrial hub of Perundurai. This four-story structure utilizes a high-strength concrete core and wide-span beam execution to provide flexible, open-plan office spaces. The exterior features a contemporary glass and ACP facade, while the interior is equipped with high-speed elevator systems and advanced fire safety infrastructure.",
    image: "/projects/sri_business_center.png",
    gallery: [
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "03",
    title: "ROYAL FAMILY RESIDENCE",
    category: "Modern Residential",
    location: "Bhavani, Erode",
    client: "Private Client",
    duration: "14 Months",
    status: "Completed",
    budget: "₹95 Lakhs",
    description: "A contemporary residential home featuring elegant interiors, premium flooring, modular kitchen solutions, and optimized natural lighting.",
    fullDescription: "Royal Family Residence is a masterclass in space optimization and natural lighting. Designed to meet the specific needs of a modern family, the home features a double-height living room that facilitates natural air circulation. Premium vitrified tiling, custom-designed woodwork, and a smart home automation system for lighting and security were key highlights of this 14-month construction project.",
    image: "/projects/royal_family_residence.png",
    gallery: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "04",
    title: "ELITE OFFICE INTERIORS",
    category: "Interior Construction",
    location: "Chithode, Erode",
    client: "Elite Business Solutions",
    duration: "08 Months",
    status: "Completed",
    budget: "₹45 Lakhs",
    description: "A complete corporate interior transformation with false ceilings, glass partitions, custom lighting, and premium workspace finishing.",
    fullDescription: "Transforming a 10,000 sq.ft. raw shell into a high-performance workspace, the Elite Office Interiors project focused on acoustic integrity and ergonomic design. We utilized frameless structural glass partitions to maintain visual transparency while providing sound isolation. The project also featured energy-efficient LED lighting systems and custom-fabricated workstation furniture.",
    image: "/projects/elite_office_interiors.png",
    gallery: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "05",
    title: "CITY TRADE COMPLEX",
    category: "Retail & Commercial",
    location: "Gobichettipalayam",
    client: "Gobi Trade Association",
    duration: "30 Months",
    status: "Ongoing",
    budget: "₹6.8 Crores",
    description: "A large-scale retail development designed for high footfall, featuring durable structural execution, modern elevation, and spacious layouts.",
    fullDescription: "The City Trade Complex is designed as a premier retail destination. The structural engineering focused on heavy-load bearing capacity to accommodate retail warehousing on the upper floors. The ground floor features a massive clear-span atrium for maximum visibility. Advanced utility systems, including centralized HVAC and specialized drainage for retail outlets, were integrated from the foundation phase.",
    image: "/projects/city_trade_complex.png",
    gallery: [
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "06",
    title: "SKYLINE HEIGHTS",
    category: "Premium Apartment Project",
    location: "Salem, Tamil Nadu",
    client: "Skyline Developers",
    duration: "42 Months",
    status: "Ongoing",
    budget: "₹18 Crores",
    description: "A premium apartment development with modern architecture, reinforced concrete framing, and stylish living spaces for urban families.",
    fullDescription: "Skyline Heights brings a new standard of high-density luxury to Salem. This 12-story residential tower utilizes a high-strength reinforced concrete core for maximum structural safety. Each apartment unit is designed with expansive balconies and floor-to-ceiling windows to provide panoramic city views. The project also included the construction of a rooftop community center and an underground two-level parking facility.",
    image: "/projects/skyline_heights.png",
    gallery: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800&auto=format&fit=crop"
    ]
  }
];

// Routes
app.get('/api/services', (req, res) => {
  res.json(servicesData);
});

app.get('/api/projects', (req, res) => {
  res.json(projectsData);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projectsData.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  res.json(project);
});

// Contact Submission API
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, details } = req.body;

  // Simple Validation
  if (!name || !email || !phone || !details) {
    return res.status(400).json({ error: 'All fields (name, email, phone, details) are required.' });
  }

  // Check if MongoDB is connected
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const newInquiry = new Inquiry({
        name,
        email,
        phone,
        details
      });

      await newInquiry.save();
      return res.status(201).json({ 
        message: 'Thank you! Your quote request has been received.', 
        inquiry: newInquiry,
        savedToDb: true
      });
    } catch (error) {
      console.error('Failed to save inquiry to MongoDB, falling back to local file:', error);
    }
  } else {
    console.warn('MongoDB is not connected. Saving inquiry to local backup.');
  }

  // Fallback to local inquiries.json if database is disconnected or save failed
  try {
    const filePath = path.join(__dirname, 'inquiries.json');
    let inquiries = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      try {
        inquiries = JSON.parse(fileData);
        if (!Array.isArray(inquiries)) {
          inquiries = [];
        }
      } catch (parseErr) {
        console.error('Error parsing inquiries.json:', parseErr);
        inquiries = [];
      }
    }

    const localInquiry = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      details,
      date: new Date().toISOString()
    };

    inquiries.push(localInquiry);
    fs.writeFileSync(filePath, JSON.stringify(inquiries, null, 2), 'utf8');
    console.log('Successfully saved inquiry to local backup inquiries.json.');

    return res.status(201).json({ 
      message: 'Thank you! Your quote request has been received.', 
      inquiry: localInquiry,
      savedToDb: false
    });
  } catch (fallbackError) {
    console.error('Failed to save to local backup inquiries.json:', fallbackError);
    return res.status(500).json({ error: 'Failed to process inquiry. Please try again.' });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
