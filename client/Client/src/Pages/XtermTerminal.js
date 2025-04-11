import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const XtermTerminal = () => {
  const xtermRef = useRef(null);

  useEffect(() => {
    const terminal = new Terminal();
    terminal.open(xtermRef.current);
    
    const socket = new WebSocket('ws://localhost:3001'); // Change the WebSocket URL accordingly
    
    socket.onopen = () => {
      terminal.writeln('Connected to the server.');
    };
    
    socket.onmessage = (event) => {
      terminal.write(event.data);
    };
    
    socket.onerror = (error) => {
      terminal.writeln('Error: ' + error.message);
    };
    
    socket.onclose = () => {
      terminal.writeln('Disconnected from the server.');
    };

    terminal.onData((data) => {
      socket.send(data);
    });

    return () => {
      terminal.dispose();
      socket.close();
    };
  }, []);

  return <div ref={xtermRef} />;
};

export default XtermTerminal;
