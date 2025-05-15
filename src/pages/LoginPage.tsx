// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuthContext } from '../context/utils/authUtils';
// import { useConvexAuth } from '../hooks/useConvexAuth';
// import type { Id } from '../../convex/_generated/dataModel';

// const LoginPage = () => {
//   const [isLoginMode, setIsLoginMode] = useState(true);
//   const [username, setUsername] = useState('');
//   const [displayName, setDisplayName] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const { setAuth, isAuthenticated } = useAuthContext();
  
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/guestbook');
//     }
//   }, [isAuthenticated, navigate]);
  
//   // Use our custom hook for Convex authentication
//   const { login, register } = useConvexAuth();
  
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       handleSubmit();
//     }
//   };

//   const handleSubmit = async () => {
//     if (!username.trim()) {
//       setError('נא להזין שם משתמש');
//       return;
//     }
    
//     if (!isLoginMode && !displayName.trim()) {
//       setError('נא להזין שם תצוגה');
//       return;
//     }
    
//     if (!password.trim()) {
//       setError('נא להזין סיסמה');
//       return;
//     }
    
//     try {
//       if (isLoginMode) {
//         // Login using our custom hook
//         const result = await login(username, password);
        
//         if (result.success) {
//           console.log(result);
          
//           // For login, we need to get the user's name from the database
//           setAuth(result.userId as Id<"users">, username, result.displayName, result.isAdmin);
//           navigate('/guestbook');
//         } else {
//           setError(result.message || 'פרטי התחברות שגויים. נסה שוב.');
//         }
//       } else {
//         // Register using our custom hook
//         const result = await register(
//           username,
//           displayName,
//           password, 
//         );
        
//         if (result.success) {
//           // Auto-login after successful registration
//           const loginResult = await login(username, password);
          
//           if (loginResult.success) {
//             setAuth(loginResult.userId as Id<"users">, username, loginResult.displayName, loginResult.isAdmin);
//             navigate('/guestbook');
//           } else {
//             setError('ההרשמה הצליחה. אנא התחבר.');
//             setIsLoginMode(true);
//           }
//         } else {
//           setError(result.message || 'ההרשמה נכשלה. נסה שוב.');
//         }
//       }
//     } catch (err) {
//       setError('אירעה שגיאה. נסה שוב.');
//       console.error(err);
//     }
//   };
  
//   const toggleMode = () => {
//     setIsLoginMode(!isLoginMode);
//     setError('');
//     if (isLoginMode) {
//       // Switching to register mode, reset fields
//       setUsername('');
//       setDisplayName('');
//       setPassword('');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-book-light p-4">
//       <div className="bg-white/90 shadow-2xl rounded-xl max-w-md w-full p-10 border border-book-dark/10">
//         <h1 className="text-3xl font-bold text-center mb-6 text-book-dark">ספר ברכות</h1>
//         <p className="text-center mb-8 text-book-dark/70 text-xl">{isLoginMode ? 'התחבר כדי להמשיך' : 'צור חשבון חדש'}</p>
        
//         <div className="mb-4">
//           <input
//             id="username"
//             type="text"
//             value={username}
//             onChange={(e) => {
//               setUsername(e.target.value);
//               setError('');
//             }}
//             placeholder="שם משתמש"
//             className="w-full px-3 py-2 border border-book-dark/10 bg-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-book-accent/50 text-right"
//             aria-label="שדה שם משתמש"
//             tabIndex={0}
//           />
//         </div>
        
//         {!isLoginMode && (
//           <div className="mb-4">
//             <input
//               id="name"
//               type="text"
//               value={displayName}
//               onChange={(e) => {
//                 setDisplayName(e.target.value);
//                 setError('');
//               }}
//               placeholder="שם תצוגה"
//               className="w-full px-3 py-2 border border-book-dark/5 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-book-accent/50 text-right"
//               aria-label="שדה שם תצוגה"
//               tabIndex={0}
//             />
//           </div>
//         )}
        
//         <div className="mb-6">
//           <input
//             id="password"
//             type="password"
//             value={password}
//             onChange={(e) => {
//               setPassword(e.target.value);
//               setError('');
//             }}
//             onKeyDown={handleKeyDown}
//             placeholder="סיסמה"
//             className="w-full px-3 py-2 border border-book-dark/10 bg-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-book-accent/50 text-right"
//             aria-label="שדה סיסמה"
//             tabIndex={0}
//           />
//           {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
//         </div>
        
//         <button 
//           onClick={handleSubmit}
//           className="w-full py-3 bg-book-dark text-white rounded-md hover:bg-book-accent transition-colors duration-300 mb-4"
//           tabIndex={0}
//         >
//           {isLoginMode ? 'התחבר' : 'הירשם'}
//         </button>
        
//         <div className="text-center mt-4">
//           <button 
//             onClick={toggleMode}
//             className="text-book-dark/60 hover:text-book-dark text-sm underline"
//             tabIndex={0}
//           >
//             {isLoginMode ? 'צריך חשבון? הירשם' : 'כבר יש לך חשבון? התחבר'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
