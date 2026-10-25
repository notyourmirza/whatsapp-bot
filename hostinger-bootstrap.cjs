// Hostinger's OpenLiteSpeed Node loader loads the entry point with require().
// Keep the application itself as native ESM and bridge into it with import().
import('./dist/api/server.js').catch((error) => {
  console.error('Failed to start WA Convo:', error);
  process.exitCode = 1;
});
