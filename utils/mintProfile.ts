import { Wallet } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { Connectivity } from "oposcore";

export async function mintProfile(keypair: Keypair) {
  const wallet = new Wallet(keypair);

  const connectivity = new Connectivity(wallet, {
    endpoint:
      "https://serene-blissful-aura.solana-devnet.discover.quiknode.pro/3aaba306e19d9fbdacb30990216407675f35aa52/",
    programId: "7naVeywiE5AjY5SvwKyfRct9RQVqUTWNG36WhFu7JE6h",
  });

  const commonInfo = await connectivity.getCommonInfo();

  const res = await connectivity.mintProfileByActivationToken(
    {
      activationToken: "8ZCdorjSUHwnfZp96wquarJY9BAhHA8yTcC12uce8a3h",
      name: "",
      description: "",
      image: "",
      username: "",
    },
    commonInfo
  );

  console.log("Result: ", res);
}
