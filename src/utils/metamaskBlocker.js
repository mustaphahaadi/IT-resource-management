// Block MetaMask injection if it's causing issues
export const blockMetaMaskInjection = () => {
  // Prevent MetaMask from injecting if it's causing conflicts
  if (typeof window !== 'undefined') {
    // Override ethereum object if it exists and is causing issues
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.warn('MetaMask detected but not needed for this application');
      // You can optionally disable it or just ignore it
    }
    
    // Prevent any MetaMask connection attempts
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('MetaMask')) {
        event.preventDefault();
        console.warn('MetaMask error blocked:', event.message);
      }
    });
  }
};