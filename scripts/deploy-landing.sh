#!/bin/bash
set -e

TARGET="github-pages"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --target) TARGET="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

if [ ! -f landing/index.html ]; then
    echo "landing/index.html not found!"
    exit 1
fi

echo "Deploying landing page to $TARGET..."

case $TARGET in
    github-pages)
        echo "Deploying to GitHub Pages..."
        git subtree push --prefix landing origin gh-pages
        echo "Successfully pushed to gh-pages branch."
        ;;
    netlify)
        echo "Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Netlify CLI not found. Run 'npm install -g netlify-cli'."
            exit 1
        fi
        netlify deploy --dir=landing --prod
        ;;
    vercel)
        echo "Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Vercel CLI not found. Run 'npm install -g vercel'."
            exit 1
        fi
        vercel landing/ --prod
        ;;
    s3)
        echo "Deploying to S3..."
        if [ -z "$S3_BUCKET" ]; then
            echo "S3_BUCKET environment variable must be set."
            exit 1
        fi
        aws s3 sync landing/ s3://$S3_BUCKET/ --delete --cache-control "max-age=86400"
        if [ -n "$CF_DISTRIBUTION_ID" ]; then
            aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths "/*"
        fi
        echo "Successfully deployed to S3."
        ;;
    *)
        echo "Unknown target: $TARGET"
        exit 1
        ;;
esac
