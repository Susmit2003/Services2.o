// "use client";

// import { useState } from 'react';
// import { loginUser, getUserProfile } from '@/lib/actions/user.actions';

// export default function TestBackendPage() {
//   const [loginResult, setLoginResult] = useState<any>(null);
//   const [profileResult, setProfileResult] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   const testLogin = async () => {
//     try {
//       setError(null);
//       const result = await loginUser({
//         mobile: '+1234567890', // Test mobile number
//         password: 'testpass123'
//       });
//       setLoginResult(result);
//       console.log('Login test result:', result);
//     } catch (err: any) {
//       setError(err.message);
//       console.error('Login test error:', err);
//     }
//   };

//   const testProfile = async () => {
//     try {
//       setError(null);
//       const result = await getUserProfile();
//       setProfileResult(result);
//       console.log('Profile test result:', result);
//     } catch (err: any) {
//       setError(err.message);
//       console.error('Profile test error:', err);
//     }
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-4">Backend API Test Page</h1>
      
//       <div className="space-y-4">
//         <div className="p-4 border rounded">
//           <h2 className="font-semibold mb-2">Test Login API</h2>
//           <button 
//             onClick={testLogin}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Test Login
//           </button>
//           {loginResult && (
//             <pre className="mt-2 text-sm">
//               {JSON.stringify(loginResult, null, 2)}
//             </pre>
//           )}
//         </div>

//         <div className="p-4 border rounded">
//           <h2 className="font-semibold mb-2">Test Profile API</h2>
//           <button 
//             onClick={testProfile}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//           >
//             Test Profile
//           </button>
//           {profileResult && (
//             <pre className="mt-2 text-sm">
//               {JSON.stringify(profileResult, null, 2)}
//             </pre>
//           )}
//         </div>

//         {error && (
//           <div className="p-4 border rounded bg-red-50">
//             <h2 className="font-semibold text-red-600">Error:</h2>
//             <p className="text-red-600">{error}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// } 


"use client";

import { useState } from 'react';
import { loginUser, getUserProfile } from '@/lib/actions/user.actions';

export default function TestBackendPage() {
    const [loginResult, setLoginResult] = useState<any>(null);
    const [profileResult, setProfileResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const testLogin = async () => {
        try {
            setError(null);
            // ✅ FIX: Changed 'mobile' to 'identifier' to match the LoginData type
            const result = await loginUser({
                identifier: '+1234567890', // Test mobile number
                password: 'testpass123'
            });
            setLoginResult(result);
            console.log('Login test result:', result);
        } catch (err: any) {
            setError(err.message);
            console.error('Login test error:', err);
        }
    };

    const testProfile = async () => {
        try {
            setError(null);
            const result = await getUserProfile();
            setProfileResult(result);
            console.log('Profile test result:', result);
        } catch (err: any) {
            setError(err.message);
            console.error('Profile test error:', err);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Backend API Test Page</h1>
            
            <div className="space-y-4">
                <div className="p-4 border rounded">
                    <h2 className="font-semibold mb-2">Test Login API</h2>
                    <button 
                        onClick={testLogin}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Test Login
                    </button>
                    {loginResult && (
                        <pre className="mt-2 text-sm">
                            {JSON.stringify(loginResult, null, 2)}
                        </pre>
                    )}
                </div>

                <div className="p-4 border rounded">
                    <h2 className="font-semibold mb-2">Test Profile API</h2>
                    <button 
                        onClick={testProfile}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Test Profile
                    </button>
                    {profileResult && (
                        <pre className="mt-2 text-sm">
                            {JSON.stringify(profileResult, null, 2)}
                        </pre>
                    )}
                </div>

                {error && (
                    <div className="p-4 border rounded bg-red-50">
                        <h2 className="font-semibold text-red-600">Error:</h2>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}