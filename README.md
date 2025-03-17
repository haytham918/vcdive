# VCDive


![Home Page](/github_readme/home_page.jpg)

## Getting Started

**Make sure you have `node` and `pnpm` installed**  
Install packages:

```bash
pnpm install
```

Run the develpment server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to use CAEN Fowarding

1. **Make sure you are on U-M Wifi or VPN**
2. Update `src/parse/main.py:debug_vcd_on_caen()` with your **uniqname** and **parent directory containing /vcd/**
3. Set **SSH_CAEN_PASSWORD** in environmental variable with your U-M Password  
    * `export SSH_CAEN_PASSWORD=<your_password>`, you can also add to "\~/.bash_profile" or "\~/.zshrc"  
4. Set **UNIQUE_NAME** in environmental variable with your U-M Uniqname  
    * `export UNIQUE_NAME=<your_uniqname>`
5. Set **CAEN_REPO_PATH** in environmental variable with your CAEN path  
    * `export CAEN_REPO_PATH=<your_caen_path>` (e.g. `/home/<unique_name>/eecs470/p4-w25.group11/`), the **ending /** is necessary
6. Be ready for a DUO push

## Acknoledgement
We get our inspiration from [Deric Dinu Danel's visual debugger](https://github.com/dericdinudaniel/eecs470-p4-gui-debugger.git). We appreciate him sharing his work with us and explaining some workflow. 

<!-- You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file. -->

<!-- This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->
