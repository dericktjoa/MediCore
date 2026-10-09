import React from "react";
import {
  Clipboard,
  Cog,
  DollarSign,
  HeartPulse,
  Hospital,
  Shield,
  Users,
  Clock,
  ChartBar,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Button = ({ children, primary, onClick, ...props }) => (
  <button
    className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      primary
        ? "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        : "text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500"
    }`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);


const Card = ({ icon: Icon, title, description, primary }) => (
  <div
    className={`rounded-lg shadow-md p-6 ${
      primary ? "bg-white" : "bg-gray-100"
    }`}
  >
    <Icon className="w-8 h-8 text-blue-600 mb-4" />
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
  </div>
);

const Section = ({ children, bg, height }) => (
  <section className={`${height || "py-20"} ${bg} content-center`}>
    <div className="container mx-auto px-4 h-full">{children}</div>
  </section>
);

const Home = () => {
  const navigate = useNavigate();
  const handleButtonClick = (route) => {
    navigate(route);
  };

  return (
    <div className="flex min-h-screen relative overflow-x-hidden">
      {/* Main Content */}
      <div className="flex flex-col w-full">
        <header className="flex items-center justify-between px-6 py-4 bg-white">
          <div className="flex items-center gap-2">
            <Hospital className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">MediCore</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button primary onClick={() => handleButtonClick("/login")}>
              Login
            </Button>
            <Button onClick={() => handleButtonClick("/signup")}>Sign Up</Button>
          </nav>
        </header>

        <main className="flex-1">
          {/* All your sections remain unchanged */}
          {/* ... (same Section blocks here) */}
          <Section bg="bg-blue-600" height="min-h-[30rem]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
              <div>
                <h1 className="text-5xl font-bold text-white mb-6 text-left">
                  Streamline Your Hospital Management
                </h1>
                <p className="text-xl text-white mb-10 text-left">
                  Our comprehensive hospital management system helps you optimize
                  patient care, streamline operations, and improve overall
                  efficiency.
                </p>
                <div className="flex gap-4 justify-left">
                  <Button onClick={() => handleButtonClick("/login")}>
                    Appointments
                  </Button>
                </div>
              </div>
              <div className="bg-gray-200 w-full h-full min-h-[20rem] rounded-lg overflow-hidden">
                <img src="home-1.jpeg" alt="" />
              </div>
            </div>
          </Section>

          {/* Repeat all other sections below here as in your original code */}
          {/* Patient Management, Operations, Features etc... */}

          <Section>
            <h2 className="text-3xl font-bold mb-12 text-center">
              Why Choose MediCore?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Clipboard,
                  title: "Improved Efficiency",
                  description:
                    "Our system streamlines administrative tasks, reducing paperwork and improving overall hospital efficiency.",
                },
                {
                  icon: Users,
                  title: "Enhanced Patient Care",
                  description:
                    "With comprehensive patient records and intelligent scheduling, our system helps you provide better care to your patients.",
                },
                {
                  icon: DollarSign,
                  title: "Cost Savings",
                  description:
                    "Our hospital management system helps you optimize operations and reduce overhead costs, leading to significant cost savings.",
                },
                {
                  icon: HeartPulse,
                  title: "Improved Patient Outcomes",
                  description:
                    "By streamlining processes and enhancing patient care, our system helps you improve overall patient outcomes and satisfaction.",
                },
                {
                  icon: Shield,
                  title: "Secure Data Management",
                  description:
                    "Our system ensures the security and confidentiality of all patient data, with robust encryption and access controls.",
                },
                {
                  icon: Cog,
                  title: "Customizable Solutions",
                  description:
                    "Our system is highly configurable, allowing you to tailor it to your specific hospital's needs and workflows.",
                },
                {
                  icon: Clock,
                  title: "Time-Saving Features",
                  description:
                    "Automate routine tasks and streamline workflows to save valuable time for healthcare professionals.",
                },
                {
                  icon: ChartBar,
                  title: "Advanced Analytics",
                  description:
                    "Gain insights into hospital operations with powerful reporting and analytics tools.",
                },
                {
                  icon: Globe,
                  title: "Scalable Infrastructure",
                  description:
                    "Our system grows with your organization, supporting multiple locations and expanding user bases.",
                },
              ].map((card, index) => (
                <Card key={index} {...card} />
              ))}
            </div>
          </Section>

        </main>

        <footer className="bg-white py-6 border-t">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <p className="text-gray-600">
              &copy; 2024 MediCore. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

    </div>
  );
};

export default Home;
