export const PORTFOLIO_DATA = {
  name: "Vaibhav Kundu",
  role: "Machine Learning & Software Developer",
  location: "Kolkata, India",
  email: "vaibhavkundu69@gmail.com",
  phone: "+91-9836026975",
  linkedin: "https://linkedin.com/in/vaibhav-kundu-b074a0240",
  github: "https://github.com/vaibhavkundu123",

  profileImage: "/me.jpg",
  resumePath: "/resume.pdf",

  taglines: [
    "Machine Learning Researcher",
    "Research Trainee @ DRDO (CABS)",
    "IEEE Best Paper Award Winner",
    "Deep Learning & Speech AI Engineer",
    "Computer Science Developer"
  ],

  about: "Motivated B.Tech Computer Science student with practical experience in Machine Learning and Deep Learning. Currently a Research Trainee at DRDO (CABS), developing speech processing systems for tactical communications using the NVIDIA NeMo framework and models like MarbleNet and Titanet-L. Proficient in Python, TensorFlow, and PyTorch, with a track record of building predictive models and conducting comparative neural network studies to optimize model accuracy.",

  stats: [
    { label: "Research Venue", value: "DRDO CABS" },
    { label: "Best Paper", value: "IEEE SPACE '26" },
    { label: "Degree", value: "B.Tech CSE" },
    { label: "Leadership", value: "VP @ GNX" }
  ],

  skills: [
    {
      category: "Machine Learning & AI",
      color: "#00f5ff",
      items: ["NLP", "TensorFlow", "PyTorch", "Scikit-Learn", "NumPy", "Pandas", "Matplotlib", "OpenCV", "Speech Processing", "NVIDIA NeMo"]
    },
    {
      category: "Programming Languages",
      color: "#3b82f6",
      items: ["Python", "C", "Core Java", "SQL", "PL/SQL", "JavaScript (ES6+)"]
    },
    {
      category: "App & Web Dev",
      color: "#8b5cf6",
      items: ["Android Studio", "Android Framework (Java)", "Django", "React", "Three.js", "REST APIs"]
    },
    {
      category: "Core Concepts",
      color: "#10b981",
      items: ["Data Structures & Algorithms", "Operating Systems", "Computer Networks", "Linux Systems", "Windows", "Git / GitHub"]
    }
  ],

  experience: [
    {
      title: "Research Trainee",
      company: "DRDO, Centre for Airborne Systems (CABS)",
      location: "Bengaluru, India",
      period: "Aug 2025 - Feb 2026",
      badge: "Defense Research",
      description: [
        "Developing a state-of-the-art Speaker Identification, Diarization, and Voice Conversion system using NVIDIA NeMo framework for tactical airborne communications.",
        "Utilizing and optimizing advanced neural models such as MarbleNet, Titanet-L, and Multi-Scale Diarization Decoder (MSDD) for mission-critical speech processing.",
        "Benchmarking latency, noise-robustness, and feature extraction accuracy across noisy military tactical channels."
      ]
    },
    {
      title: "Android Development Intern",
      company: "Sasken Technologies",
      location: "Remote",
      period: "Jun 2025 - Jul 2025",
      badge: "Mobile Architecture",
      description: [
        "Built a high-performance School Management App using Java (Android Framework) with modules for student profiles, notices, queries, attendance, and leave tracking.",
        "Enhanced communication channels between students, parents, and administrators with real-time syncing and responsive UI."
      ]
    },
    {
      title: "Summer Internship (Research)",
      company: "IEEE Computational Intelligence Society Kolkata Chapter",
      location: "Remote",
      period: "Jun 2025 - Jul 2025",
      badge: "Deep Learning Research",
      description: [
        "Conducted a rigorous comparative study between the performances of Convolutional Neural Networks (CNN) and Vision Transformers (ViT) on identical benchmark datasets.",
        "Analyzed attention heatmaps, compute complexity, and convergence rates."
      ]
    },
    {
      title: "Summer Internship (Data Science)",
      company: "Celebal Technologies",
      location: "Remote",
      period: "May 2025 - Jul 2025",
      badge: "Data Science",
      description: [
        "Built a Python-based predictive analytics system to predict student examination scores using Linear Regression and feature engineering.",
        "Utilized Pandas/NumPy for exploratory data analysis, Matplotlib for data visualization, and Scikit-learn for model tuning."
      ]
    },
    {
      title: "Project Intern",
      company: "Infosys Springboard",
      location: "Remote",
      period: "Oct 2024 - Dec 2024",
      badge: "Healthcare ML",
      description: [
        "Built an end-to-end machine learning system to predict patient disease probabilities based on reported symptoms and biological parameters.",
        "Full-stack delivery using Python ML algorithms paired with a Django web application interface."
      ]
    }
  ],

  achievements: [
    {
      title: "Best Paper Award – IEEE SPACE 2026",
      organization: "IEEE Aerospace & Electronic Systems Society (AESS)",
      conference: "3rd IEEE International Conference on Space, Aerospace & Defence (SPACE 2026)",
      track: "Assembly, Integration & Testing / Checkout Track",
      location: "Bengaluru, India",
      date: "Jul 2026",
      role: "Co-Author",
      paperTitle: "AI-Based Voice Deception System for Aerospace and Defense",
      collaboration: "DRDO (Centre for Airborne Systems)",
      badge: "🏆 IEEE Best Paper Winner",
      highlights: [
        "Awarded prestigious Best Paper in the Assembly, Integration & Testing / Checkout track at the 3rd IEEE International Conference on Space, Aerospace & Defence (SPACE 2026).",
        "Co-authored research paper: “AI-Based Voice Deception System for Aerospace and Defense” in direct collaboration with defense scientists at DRDO (Centre for Airborne Systems).",
        "Pioneered defensive countermeasures and generative voice deception synthesis tailored for aerospace and tactical communication scenarios."
      ]
    }
  ],

  education: [
    {
      degree: "B.Tech in Computer Science & Engineering",
      institution: "Netaji Subhas Engineering College",
      location: "Kolkata, India",
      period: "2022 - 2026",
      score: "CGPA: 7.49 (avg.)",
      badge: "Higher Education",
      extras: "Vice President, GNX (Official GNU/Linux group and open-source tech community of NSEC)"
    },
    {
      degree: "Class XII (CBSE Senior Secondary)",
      institution: "South Point High School",
      location: "Kolkata, India",
      period: "2022",
      score: "Score: 70.4%",
      badge: "CBSE XII"
    },
    {
      degree: "Class X (CBSE Secondary)",
      institution: "South Point High School",
      location: "Kolkata, India",
      period: "2020",
      score: "Score: 90.8%",
      badge: "CBSE X"
    }
  ],

  stations: [
    {
      id: "about",
      name: "Command Deck",
      subtitle: "Identity & Bio Hologram",
      position: [0, 0, 0],
      color: "#00f5ff",
      iconName: "User",
      description: "Primary avatar terminal displaying Vaibhav's profile, tactical speech AI background, and resume download."
    },
    {
      id: "skills",
      name: "Neural Nexus",
      subtitle: "3D AI Matrix & Toolkit",
      position: [42, 0, -25],
      color: "#3b82f6",
      iconName: "BrainCircuit",
      description: "Interactive synaptic network visualizing proficiency across AI/ML, Python, Deep Learning frameworks, and Systems."
    },
    {
      id: "experience",
      name: "Defense Hangar",
      subtitle: "Tactical Research & Traineeship",
      position: [35, 0, 40],
      color: "#10b981",
      iconName: "Briefcase",
      description: "Telemetry control station spotlighting DRDO CABS speech systems research, Sasken, Celebal, and Infosys."
    },
    {
      id: "achievements",
      name: "Trophy Vault",
      subtitle: "IEEE SPACE 2026 Best Paper",
      position: [-40, 0, 35],
      color: "#f59e0b",
      iconName: "Trophy",
      description: "Golden award pedestal celebrating the IEEE SPACE 2026 Best Paper honor with DRDO CABS."
    },
    {
      id: "education",
      name: "Cyber Archives",
      subtitle: "Academic Matrix & Leadership",
      position: [-42, 0, -28],
      color: "#8b5cf6",
      iconName: "GraduationCap",
      description: "Monolithic databanks storing academic degrees from NSEC and South Point, plus GNX Vice-Presidency."
    },
    {
      id: "contact",
      name: "Quantum Relay",
      subtitle: "Uplink & AI Co-Pilot",
      position: [0, 0, -55],
      color: "#ec4899",
      iconName: "Send",
      description: "Deep-space comms dish to dispatch messages directly via Formspree, auto-pitch JDs, or chat with Gemini AI."
    }
  ]
};

export const PORTFOLIO_CONTEXT = JSON.stringify({
  ...PORTFOLIO_DATA,
  skills: PORTFOLIO_DATA.skills.map(s => ({ category: s.category, items: s.items }))
});

export const FORMSPREE_ID = "mwvnrpog";

export const callGeminiAPI = async (prompt, systemInstruction) => {
  const apiKey = "AIzaSyCcaVzryEL5pb4UbzoeFA2bLJ0qihQaBnc";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  const delays = [1000, 2000, 4000];

  for (let i = 0; i < delays.length + 1; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Communication received, but transmission was empty.";
    } catch (error) {
      if (i === delays.length) return "Subspace communications are experiencing high interference. Please try again shortly!";
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};
