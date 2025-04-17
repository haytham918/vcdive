# VCDive
Visual Debugger for VCD files (from VPD) with CAEN Forwarding

![Home Page](/github_readme/home_page.png)

![Debugger Page](/github_readme/main_light.png)

![Debugger Dark](/github_readme/main_dark.png)

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

Or run the production build (idally slightly faster:

```bash
pnpm build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to use CAEN Fowarding

1. **Make sure you are on U-M Wifi or VPN**
2. Set **SSH_CAEN_PASSWORD** in environmental variable with your U-M Password
    - `export SSH_CAEN_PASSWORD=<your_password>`, you can also add to "\~/.bash_profile" or "\~/.zshrc"
3. Set **UNIQUE_NAME** in environmental variable with your U-M Uniqname
    - `export UNIQUE_NAME=<your_uniqname>`
4. Set **CAEN_REPO_PATH** in environmental variable with your CAEN path that contains **/vcd/** directory
    - `export CAEN_REPO_PATH=<your_caen_path>` (e.g. `/home/<unique_name>/eecs470/p4-w25.group11/`), the **ending /** is necessary
5. Be ready for a DUO push

## Acknoledgement

We get our inspiration from [Deric Dinu Danel's visual debugger](https://github.com/dericdinudaniel/eecs470-p4-gui-debugger.git). We appreciate him sharing his work with us and explaining some workflow.
