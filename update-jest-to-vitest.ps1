# PowerShell script to update all test files from Jest to Vitest

Get-ChildItem -Path __tests__ -Recurse -Include *.test.ts,*.test.tsx | ForEach-Object {
    Write-Host "Processing: $($_.Name)"

    $content = Get-Content $_.FullName -Raw

    # Replace jest with vi
    $content = $content -replace 'jest\.clearAllMocks','vi.clearAllMocks'
    $content = $content -replace 'jest\.spyOn','vi.spyOn'
    $content = $content -replace 'jest\.fn','vi.fn'
    $content = $content -replace 'jest\.mock','vi.mock'
    $content = $content -replace 'jest\.resetModules','vi.resetModules'

    # Add vitest import if vi. is used but import doesn't exist
    if ($content -match 'vi\.' -and $content -notmatch 'from [''"]vitest[''"]') {
        # Split into lines
        $lines = $content -split "`r?`n"

        # Insert import after first line
        $newLines = @($lines[0]) + "import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';" + $lines[1..($lines.Length-1)]

        $content = $newLines -join "`r`n"
    }

    Set-Content -Path $_.FullName -Value $content -NoNewline
}

Write-Host "Done! All test files updated."
