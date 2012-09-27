The paper.js is based on the commit 'ddbcb30ab14fff1fdda9238b10929d5fc7d40300'.
For now it's the latest version (see https://github.com/paperjs/paper.js).

In this submition, I fixed one issue about raster hit-test in Paperjs, 
see 'https://github.com/paperjs/paper.js/issues/45' for details. The changes are

1. Raster._hitTest (line 3139).
2. Item.hitTest (line 2390).

Currently, the change only affects the Raster in Paper.js. So the side-effect or
bugs imported will be small.

I attached one test page in ./test/raster_hit.html for this fix.