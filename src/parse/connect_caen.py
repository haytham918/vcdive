"""
Methods for connect to caen and do request from there
"""
import pexpect
import sys
import os


def handle_duo(child):
    """
    Handle the Duo prompt. 
    '1' to push
    """
    # Automatically choose push = 1
    child.sendline("1")  # "1" for push
    idx = child.expect([
        r'(\$|#|%|>)\s',
        pexpect.EOF,
        pexpect.TIMEOUT
    ], timeout=60)  # Might need up to 60 seconds to accept on phone

    if idx in (1, 2):
        raise RuntimeError("Failed to reach shell after Duo push approval")


def ssh_caen_with_duo(username: str, remote_commands: str) -> None:
    """
    SSH into the remote server using password + Duo 2FA.
    :param username: your UM uniquename
    :param remote_commands: list of the remote command you want to carry out in CAEN
    :return: The output of the remote command.
    """

    ssh_password = os.environ.get("SSH_CAEN_PASSWORD")
    if not ssh_password:
        raise ValueError(
            "No SSH_CAEN_PASSWORD found in the environment variables.")
    if (os.environ.get("USE_WITHOUT_COURSE")):
        ssh_cmd = f"ssh {username}@login.engin.umich.edu -R 8080:127.0.0.1:5000"
    else:
        ssh_cmd = f"ssh {username}@login-course.engin.umich.edu -R 8080:127.0.0.1:5000"
    child = pexpect.spawn(ssh_cmd, encoding='utf-8')
    child.logfile = sys.stderr

    idx = child.expect([
        r'[Pp]assword:',
        r'Duo two-factor login',
        r'(\$|#|%|>)\s',
        pexpect.EOF,
        pexpect.TIMEOUT
    ], timeout=20)

    if idx == 0:
        # Need to send the password
        print("NEED TO SEND PASSWORD", file=sys.stderr)
        child.sendline(ssh_password)
        idx_password = child.expect([
            r'Duo two-factor login*',
            r'[Pp]assword:',
            pexpect.EOF,
            pexpect.TIMEOUT
        ], timeout=20)

        if idx_password == 0:
            # Need a DUO PUSH
            print("DUO occuring", file=sys.stderr)
            handle_duo(child)
        elif idx_password == 1:
            print("CHECK YOUR SSH PASSWORD BUDDY", file=sys.stderr)
            raise RuntimeError("PASSWORD Incorrect")
        else:
            raise RuntimeError(
                "EOF or TIMEOUT: DUO prompt doesn't appear after password")
    elif idx == 1:
        # Need to do a Duo push
        handle_duo(child)

    elif idx == 2:
        # Can directly prompt
        pass
    else:
        raise RuntimeError("Error: prompt is unexpected")

    # Run the actual commands
    for cmd in remote_commands:
        child.sendline(cmd)
        # If the command is not a curl, we expect it to be really fast
        cmd_timeout = 10
        if cmd.startswith("curl"):
            cmd_timeout = 120  # Set longer timeout for the curl command

        idx_command = child.expect([
            r'(\$|#|%|>)\s',               # 0 => Command prompt
            r"Warning: setting file .* failed!",  # 1 => Specific error pattern
            # 2 => Another error pattern
            r"curl: \(26\) read function returned funny value",
            pexpect.EOF,                  # 3
            pexpect.TIMEOUT               # 4
        ], timeout=cmd_timeout)

        if idx_command in [1, 2]:
            # We matched an error message
            raise RuntimeError(
                f"Error: '{cmd}'")

        elif idx_command in [3, 4]:
            # EOF or TIMEOUT
            raise RuntimeError(f"Command '{cmd}' failed with EOF or TIMEOUT.")

    # Remember to exit
    child.sendline("exit")
    child.expect(pexpect.EOF)


def debug_vcd_on_caen(username: str, directory_name: str, file_name: str) -> None:
    """
    username: Your uniqname
    direcotry_name: the path to your parent repo of vcd, ending with /
        -- eg. "~/eecs470/p4-w25.group11/"
    filename: actual file
    """
    cd_command = f"cd {directory_name}vcd/"
    post_command = f'curl -X POST http://localhost:8080/backend/parse/ -F "file=@{file_name}"'
    commands = [cd_command, post_command]
    ssh_caen_with_duo(username, commands)


if __name__ == "__main__":
    debug_vcd_on_caen("yunxuant", "~/eecs470/p4-w25.group11/", "uart.vcd")
