// User-specific localStorage-based storage utility
const storage = {
  get: async (key) => {
    // Get current user
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
      return null;
    }
    
    const currentUser = JSON.parse(currentUserJson);
    const userKey = `${currentUser.username}_${key}`;
    
    const value = localStorage.getItem(userKey);
    if (value) {
      return { value };
    }
    return null;
  },
  set: async (key, value) => {
    // Get current user
    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
      console.error('No user logged in');
      return;
    }
    
    const currentUser = JSON.parse(currentUserJson);
    const userKey = `${currentUser.username}_${key}`;
    
    localStorage.setItem(userKey, value);
  }
};

// Expose storage to window for the component to use
window.storage = storage;

export default storage;
