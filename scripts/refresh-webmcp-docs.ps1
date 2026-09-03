$ErrorActionPreference = 'Stop'

$projectRoot = 'C:\Users\Admin\Desktop\hackathon\nod'
$docsRoot = Join-Path $projectRoot 'docs'
$snapshotRoot = Join-Path $docsRoot 'snapshots'
$scriptRoot = Join-Path $projectRoot 'scripts'

New-Item -ItemType Directory -Force -Path $snapshotRoot, $scriptRoot | Out-Null

@'
# nod

Local WebMCP hackathon starter repository.

## Reference library

Run `powershell -ExecutionPolicy Bypass -File scripts/refresh-webmcp-docs.ps1` to refresh the local WebMCP reference snapshots. The generated source index is at `docs/RESOURCE_INDEX.md`; raw page snapshots live in `docs/snapshots/` and are intentionally ignored so browsing and refresh output never dirties the project.

## First project steps

1. Review `docs/RESOURCE_INDEX.md` for official docs, security guidance, demos, templates, hosting, and hackathon support.
2. Build and deploy the app.
3. Test it in ChatGPT's in-app browser or Chrome with the WebMCP testing flag enabled at `chrome://flags/#enable-webmcp-testing`.
'@ | Set-Content -Encoding utf8 (Join-Path $projectRoot 'README.md')

@'
# Dependencies and package-manager files
node_modules/
.pnpm-store/
.yarn/

# Builds, coverage, caches, and logs
dist/
build/
.next/
.cache/
coverage/
*.log

# Secrets and local configuration
.env
.env.*
!.env.example

# Local reference downloads and optional checked-out examples.
# Refresh them with scripts/refresh-webmcp-docs.ps1; keep the repo status clean.
docs/snapshots/
.sources/

# OS and editor noise
.DS_Store
Thumbs.db
.vscode/
.idea/
'@ | Set-Content -Encoding utf8 (Join-Path $projectRoot '.gitignore')

@'
# WebMCP local reference library

`RESOURCE_INDEX.md` is generated from the hackathon resource list. Each entry points to a local HTML snapshot under `snapshots/`; these snapshots are intentionally Git-ignored because they are third-party, refreshable reference material. The refresh script preserves a `download-report.csv` so failed or unavailable sources are visible.

Use the official specification, Chrome developer documentation, and the security guide as primary references when implementing tools. The supporter resources are catalogued for templates, deployment options, credits, and examples.
'@ | Set-Content -Encoding utf8 (Join-Path $docsRoot 'README.md')

$resources = @(
  @{ Group = 'Core WebMCP documentation'; Title = 'WebMCP specification source, explainers, and issues'; Url = 'https://github.com/webmachinelearning/webmcp' },
  @{ Group = 'Core WebMCP documentation'; Title = 'WebMCP developer documentation'; Url = 'https://developer.chrome.com/docs/ai/webmcp' },
  @{ Group = 'Core WebMCP documentation'; Title = 'WebMCP origin trial'; Url = 'https://developer.chrome.com/blog/ai-webmcp-origin-trial' },
  @{ Group = 'Core WebMCP documentation'; Title = 'WebMCP tool security guide'; Url = 'https://developer.chrome.com/docs/ai/webmcp/secure-tools' },
  @{ Group = 'OpenAI'; Title = 'WebMCP Showcase'; Url = 'https://developers.openai.com/showcase?view=webmcp-apps' },
  @{ Group = 'OpenAI'; Title = 'ChatGPT Sites'; Url = 'https://learn.chatgpt.com/docs/sites?surface=app' },
  @{ Group = 'Cloudflare'; Title = 'WebMCP overview'; Url = 'https://blog.cloudflare.com/webmcp/' },
  @{ Group = 'Cloudflare'; Title = 'WebMCP on Browser Run'; Url = 'https://developers.cloudflare.com/browser-run/features/webmcp/' },
  @{ Group = 'Cloudflare'; Title = 'Coffee-store demo'; Url = 'https://webmcp-coffee.jilles.fyi/' },
  @{ Group = 'Cloudflare'; Title = 'Cloudflare WebMCP Challenge'; Url = 'https://webmcp-challenge.examples.workers.dev/' },
  @{ Group = 'Cloudflare'; Title = 'WebMCP on Workers template'; Url = 'https://github.com/cloudflare/agents/tree/main/examples/webmcp-react' },
  @{ Group = 'Cloudflare'; Title = 'Cloudflare Pages / Workers'; Url = 'https://developers.cloudflare.com/pages/' },
  @{ Group = 'Vercel'; Title = 'Storefront source code'; Url = 'https://github.com/vercel/shop' },
  @{ Group = 'Vercel'; Title = 'WebMCP implementation pull request'; Url = 'https://github.com/vercel/shop/pull/498' },
  @{ Group = 'Vercel'; Title = 'Live storefront demo'; Url = 'https://template.vercel.shop/' },
  @{ Group = 'Vercel'; Title = 'Vercel pricing'; Url = 'https://vercel.com/pricing' },
  @{ Group = 'Vercel'; Title = 'Vercel build-credit redemption'; Url = 'https://credits.vercel.sh/redeem' },
  @{ Group = 'Shopify'; Title = 'Shopify WebMCP tools documentation'; Url = 'https://shopify.dev/docs/api/web-mcp' },
  @{ Group = 'Shopify'; Title = 'Shopify agentic tools'; Url = 'https://shopify.dev/docs/agents' },
  @{ Group = 'Google Chrome'; Title = 'useWebMCPTool React hook'; Url = 'https://www.npmjs.com/package/use-webmcp-tool'; FallbackUrl = 'https://registry.npmjs.org/use-webmcp-tool/latest' },
  @{ Group = 'Google Chrome'; Title = 'WebMCP Explainer'; Url = 'https://github.com/webmachinelearning/webmcp/blob/main/README.md' },
  @{ Group = 'Google Chrome'; Title = 'WebMCP with Angular'; Url = 'https://angular.dev/ai/webmcp' },
  @{ Group = 'Google Chrome'; Title = 'WebMCP evals'; Url = 'https://developer.chrome.com/docs/ai/webmcp/evals' },
  @{ Group = 'Google Chrome'; Title = 'Debug WebMCP tools'; Url = 'https://developer.chrome.com/docs/devtools/application/webmcp' },
  @{ Group = 'Google Chrome'; Title = 'Modern Web Guidance'; Url = 'https://github.com/GoogleChrome/modern-web-guidance' },
  @{ Group = 'Google Chrome'; Title = 'WebMCP demos'; Url = 'https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/demos' },
  @{ Group = 'Render'; Title = 'Render Workflows'; Url = 'https://render.com/workflows' },
  @{ Group = 'Render'; Title = 'Render Workflows documentation'; Url = 'https://render.com/docs/workflows' },
  @{ Group = 'Render'; Title = 'Render starter templates'; Url = 'https://render.com/templates' },
  @{ Group = 'Render'; Title = 'Render participant credits'; Url = 'https://credits-portal-mmdm.onrender.com/claim/openai-hackathon' },
  @{ Group = 'Render'; Title = 'Render credits documentation'; Url = 'https://render.com/docs/credits' },
  @{ Group = 'Netlify'; Title = 'Netlify'; Url = 'https://netlify.com/' },
  @{ Group = 'Netlify'; Title = 'Netlify participant-credit form'; Url = 'https://forms.gle/xw75XGUQzCXEiALc7' },
  @{ Group = 'Netlify'; Title = 'Choose your path'; Url = 'https://docs.netlify.com/start/choose-your-path/' },
  @{ Group = 'Netlify'; Title = 'WebMCP starter'; Url = 'https://webmcp-starter.netlify.app/' },
  @{ Group = 'Support'; Title = 'OpenAI Discord'; Url = 'https://discord.gg/openai' },
  @{ Group = 'Support'; Title = 'Hackathon participants'; Url = 'https://webmcp.devpost.com/participants' },
  @{ Group = 'Support'; Title = 'Hackathon discussion board'; Url = 'https://webmcp.devpost.com/forum_topics' }
)

$indexLines = @('# WebMCP resource index', '', "Last refreshed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')", '', 'This is a local, agent-readable catalogue. Open the corresponding `snapshots/*.html` file for the downloaded page; the source URL remains listed for verification and refresh.', '')
$report = @()
$grouped = $resources | Group-Object -Property { $_['Group'] }
$counter = 0

foreach ($group in $grouped) {
  $indexLines += "## $($group.Name)"
  $indexLines += ''
  foreach ($resource in $group.Group) {
    $counter++
    $slug = ('{0:D2}-{1}' -f $counter, ($resource['Title'].ToLowerInvariant() -replace '[^a-z0-9]+', '-' -replace '(^-|-$)', ''))
    $filename = "$slug.html"
    $destination = Join-Path $snapshotRoot $filename
    $status = 'downloaded'
    $detail = ''
    try {
      Invoke-WebRequest -Uri $resource['Url'] -OutFile $destination -MaximumRedirection 10 -TimeoutSec 45
    }
    catch {
      $detail = $_.Exception.Message.Replace("`r", ' ').Replace("`n", ' ')
      if (Test-Path $destination) { Remove-Item -LiteralPath $destination -Force }
      if ($resource.ContainsKey('FallbackUrl')) {
        try {
          Invoke-WebRequest -Uri $resource['FallbackUrl'] -OutFile $destination -MaximumRedirection 10 -TimeoutSec 45
          $status = 'downloaded-via-fallback'
          $detail = "Primary page unavailable; saved package metadata from $($resource['FallbackUrl'])."
        }
        catch {
          $status = 'failed'
          $detail += " Fallback failed: $($_.Exception.Message.Replace("`r", ' ').Replace("`n", ' '))"
        }
      }
      else {
        $status = 'failed'
      }
    }
    $indexLines += "- [$($resource['Title'])]($($resource['Url'])) - local snapshot: `snapshots/$filename` ($status)"
    $report += [PSCustomObject]@{ Group = $resource['Group']; Title = $resource['Title']; Url = $resource['Url']; Snapshot = "snapshots/$filename"; Status = $status; Detail = $detail }
  }
  $indexLines += ''
}

$indexLines += '## Hackathon test reminder'
$indexLines += ''
$indexLines += 'After deployment, test the app in ChatGPT''s in-app browser or in Google Chrome with WebMCP enabled at `chrome://flags/#enable-webmcp-testing`.'
$indexLines | Set-Content -Encoding utf8 (Join-Path $docsRoot 'RESOURCE_INDEX.md')
$report | Export-Csv -NoTypeInformation -Encoding utf8 (Join-Path $snapshotRoot 'download-report.csv')

$self = $MyInvocation.MyCommand.Path
Copy-Item -LiteralPath $self -Destination (Join-Path $scriptRoot 'refresh-webmcp-docs.ps1') -Force

if (-not (Test-Path (Join-Path $projectRoot '.git'))) {
  & git -C $projectRoot init
}

Write-Output "Project prepared at $projectRoot"
Write-Output "Downloaded $($report.Where({ $_.Status -like 'downloaded*' }).Count) of $($report.Count) resource snapshots."
Write-Output "Failed downloads: $($report.Where({ $_.Status -eq 'failed' }).Count)"
