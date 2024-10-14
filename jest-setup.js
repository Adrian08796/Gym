// Mock the import.meta.env object
global.import = {
    meta: {
      env: {
        VITE_BACKEND_HOST: 'http://localhost:4500/api'
      }
    }
  };