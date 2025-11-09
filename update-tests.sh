#!/bin/bash

# Update all test files to use Vitest instead of Jest

# Find all test files
find __tests__ -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
    echo "Processing: $file"

    # Replace jest with vi in the file
    sed -i 's/jest\.clearAllMocks/vi.clearAllMocks/g' "$file"
    sed -i 's/jest\.spyOn/vi.spyOn/g' "$file"
    sed -i 's/jest\.fn/vi.fn/g' "$file"
    sed -i 's/jest\.mock/vi.mock/g' "$file"

    # Add vitest imports if not already present and if jest. was found
    if grep -q "vi\." "$file" && ! grep -q "import.*vitest" "$file"; then
        # Check if there's already an import from @testing-library/react
        if grep -q "from '@testing-library/react'" "$file"; then
            # Add vitest import after the testing-library import
            sed -i "/from '@testing-library\/react'/a import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';" "$file"
        else
            # Add it at the top after other imports
            sed -i "1a import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';" "$file"
        fi
    fi
done

echo "Done!"
