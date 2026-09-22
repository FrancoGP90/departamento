<#
  Genera versiones livianas de las fotos de assets/img para la web:
    - assets/img/full/   -> para el hero y el visor ampliado (lado mayor 1920px, calidad 82)
    - assets/img/thumbs/ -> para las miniaturas de la galeria (lado mayor 640px, calidad 75)
  No modifica los archivos originales en assets/img ni en Downloads.
  Uso: ejecutar desde la raiz del proyecto -> pwsh ./scripts/optimize-images.ps1
#>

Add-Type -AssemblyName System.Drawing

$srcDir = Join-Path $PSScriptRoot '..\assets\img' | Resolve-Path
$fullDir = Join-Path $srcDir 'full'
$thumbDir = Join-Path $srcDir 'thumbs'
New-Item -ItemType Directory -Force -Path $fullDir, $thumbDir | Out-Null

$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }

function Resize-Image {
  param(
    [string]$SourcePath,
    [string]$DestPath,
    [int]$MaxDimension,
    [int]$Quality
  )

  $original = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $ratio = [Math]::Min(1.0, [double]$MaxDimension / [Math]::Max($original.Width, $original.Height))
    $newWidth = [int]([Math]::Round($original.Width * $ratio))
    $newHeight = [int]([Math]::Round($original.Height * $ratio))

    $bitmap = New-Object System.Drawing.Bitmap $newWidth, $newHeight
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($original, 0, 0, $newWidth, $newHeight)
      } finally {
        $graphics.Dispose()
      }

      $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
      $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
        [System.Drawing.Imaging.Encoder]::Quality, [int64]$Quality)
      $bitmap.Save($DestPath, $jpegEncoder, $encoderParams)
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $original.Dispose()
  }
}

Get-ChildItem (Join-Path $srcDir '*.jpg') | ForEach-Object {
  Resize-Image -SourcePath $_.FullName -DestPath (Join-Path $fullDir $_.Name) -MaxDimension 1920 -Quality 82
  Resize-Image -SourcePath $_.FullName -DestPath (Join-Path $thumbDir $_.Name) -MaxDimension 640 -Quality 75
  Write-Host "Optimizada: $($_.Name)"
}
