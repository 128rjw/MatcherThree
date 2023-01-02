    // Remove clusters and insert tiles
    function resolveClusters() {
        log('resolving clusters');
        findClusters();

        // While there are clusters left
        while (foundClusters.length > 0) {

            // Remove clusters
            removeMarkedTiles();

            // Shift tiles
            shiftTiles();

            // Check if there are clusters left
            findClusters();
        }
    }