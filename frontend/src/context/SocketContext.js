
// import React, { createContext, useContext, useState } from "react";
// import pollService from "../services/pollService";

// const SocketContext = createContext();

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }) => {
//   const [connected, setConnected] = useState(true);

//   return (
//     <SocketContext.Provider
//       value={{
//         socket: pollService,
//         connected,
//         pollService,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// };

import { createContext, useContext } from "react";
import pollService from "../services/pollService";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  // Remove the unused setConnected state
  const connected = true; // Always connected in local mode

  return (
    <SocketContext.Provider
      value={{
        socket: pollService,
        connected,
        pollService,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
