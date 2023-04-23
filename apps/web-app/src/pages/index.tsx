import { Identity } from "@semaphore-protocol/identity"
import detectEthereumProvider from '@metamask/detect-provider';
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useState } from "react"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import { ethers } from "ethers";

export default function IdentitiesPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const [_identity, setIdentity] = useState<Identity>()

    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (identityString) {
            const identity = new Identity(identityString)

            setIdentity(identity)

            setLogs("Your Semaphore identity was retrieved from the browser cache 👌🏽")
        } else {
            setLogs("Create your Semaphore identity 👆🏽")
        }
    }, [])

    const createIdentity = useCallback(async () => {
        const identity = new Identity()

        setIdentity(identity)

        localStorage.setItem("identity", identity.toString())

        setLogs("Your new Semaphore identity was just created 🎉")
    }, [])

    const createIdentityFromMetamask = useCallback(async () => {
        console.log("Create identity using metamask");
        const provider = await detectEthereumProvider();
        if (provider) {
            // From now on, this should always be true:
            // provider === window.ethereum
            await startApp(provider); // initialize your app
          } else {
            console.log('Please install MetaMask!');
          }
          
        async function startApp(provider:any) {
            // If the provider returned by detectEthereumProvider isn't the same as
            // window.ethereum, something is overwriting it – perhaps another wallet.
            if (provider !== window.ethereum) {
                console.error('Do you have multiple wallets installed?');
            }

            // Access the decentralized web!
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
                .catch((err:any) => {
                if (err.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    // If this happens, the user rejected the connection request.
                    console.log('Please connect to MetaMask.');
                } else {
                    console.error(err);
                }
            });
            const exampleMessage = 'Create Identity';
            try {
                const from = accounts[0];
                // For historical reasons, you must submit the message to sign in hex-encoded UTF-8.
                // This uses a Node.js-style buffer shim in the browser.
                const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
                const sign = await ethereum.request({
                method: 'personal_sign',
                params: [msg, from, 'Example password'],
                });
                const identity = new Identity(sign);
                setIdentity(identity)
                localStorage.setItem("identity", identity.toString())
                setLogs("Your new Semaphore identity was just created 🎉")
            } catch (err) {
                console.error(err);
            } 
        }

    }, [])

    return (
        <>
            <h2 className="font-size: 3rem;">Identities</h2>

            <p>
                Users interact with the protocol using a Semaphore{" "}
                <a
                    href="https://semaphore.appliedzkp.org/docs/guides/identities"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    identity
                </a>{" "}
                (similar to Ethereum accounts). It contains three values:
            </p>
            <ol>
                <li>Trapdoor: private, known only by user</li>
                <li>Nullifier: private, known only by user</li>
                <li>Commitment: public</li>
            </ol>

            <div className="divider"></div>

            <div className="text-top">
                <h3>Identity</h3>
                {_identity && (
                    <button className="button-link" onClick={createIdentity}>
                        New
                    </button>)}
            </div>

            {_identity ? (
                <div>
                    <div className="box">
                        <p className="box-text">Trapdoor: {_identity.trapdoor.toString()}</p>
                        <p className="box-text">Nullifier: {_identity.nullifier.toString()}</p>
                        <p className="box-text">Commitment: {_identity.commitment.toString()}</p>
                    </div>
                    <div className="text-top">
                        <button className="button-link" onClick={createIdentityFromMetamask}>
                            Load From Metamask
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <button className="button" onClick={createIdentity}>
                        Create identity
                    </button>
                    <button className="button" onClick={createIdentityFromMetamask}>
                        Generate/Load From Metamask
                    </button>
                </div>
            )}

            <div className="divider"></div>

            <Stepper step={1} onNextClick={_identity && (() => router.push("/groups"))} />
        </>
    )
}
