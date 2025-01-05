
import { motion } from 'framer-motion';
import { authAtom } from '../../store/atoms/atoms';
import { useRecoilValue } from 'recoil';

function UserDashboard() {
  const auth = useRecoilValue(authAtom);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      {/* Header Section */}
      <header className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold"
        >
          {` Welcome back, `}
          <span className="text-brand">{auth.userInfo?.name}</span>
          {` !`}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-gray-600"
        >
          Here's a quick overview of what's happening today.
        </motion.p>
      </header>

      {/* Main Content Section */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="col-span-2">
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-brand">Your Activities</h2>
            <ul className="mt-4 space-y-4 text-gray-700">
              <li>✔️ Completed task: Write blog for SEO campaign</li>
              <li>📅 Upcoming meeting: Marketing strategy - 2:00 PM</li>
              <li>📊 Analytics report: Traffic increased by 15%</li>
            </ul>
          </div>


        </div>

        {/* Right Section: Announcements */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-brand">Announcements</h2>
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-800">🚀 New Feature Released!</h3>
              <p className="text-gray-600 mt-2">Check out our new analytics dashboard for detailed insights.</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-800">📢 Maintenance Alert</h3>
              <p className="text-gray-600 mt-2">The app will be down for scheduled maintenance on Jan 10, 2025.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
