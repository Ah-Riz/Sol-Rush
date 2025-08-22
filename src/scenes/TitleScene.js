import Phaser from 'phaser';
import createAligned from '../javascript/createAligned';
import { connectWallet, getTokenBalance ,getSolBalance,getSplTokenBalance} from "../blockchain/solana";
import { PublicKey } from '@solana/web3.js';
import { mintSPLToken } from "../blockchain/tokenService.js"; // fungsi mint di file lain

export default class TitleScene extends Phaser.Scene {

  
  constructor() {
    super('title-screen');
    this.isProfileOpen = false;
    this.isNotAvailOpen = false;
    this.walletAddress = null;
  }

  preload() {
    this.width = this.scale.width;
    this.height = this.scale.height;
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    this.scene.pauseOnBlur = false;

    this.menuSong = this.sound.add('menu', { volume: 0.25, loop: true });
    this.menuSong.play();

    const bgh = this.textures.get('background').getSourceImage().height;

    this.add.tileSprite(0, this.height, this.width, bgh, 'background')
      .setOrigin(0, 1).setScrollFactor(0);

    this.bg1 = createAligned(this, -23, 'bgTree_1', true);
    // this.bg2 = createAligned(this, 100, 'lights_1', false);
    this.bg3 = createAligned(this, -53, 'bgTree_2', true);
    this.bg4 = createAligned(this, -70, 'bgTree_3', true);
    // this.bg5 = createAligned(this, 100, 'lights_2', false);
    this.bg6 = createAligned(this, -68, 'bgTree_4', true);
    // this.bg7 = createAligned(this, 0, 'upTree', true);
    this.bg8 = createAligned(this, 10, 'floor', true, -250);

    this.player = this.add.sprite(200, this.height - 95, 'player_rest');
    this.player.anims.play('rest');
  this.walletConnected = false; // status koneksi wallet
  this.walletPublicKey = null;
    const title = this.make.text({
      x: this.width / 2,
      y: this.height / 2 - 140,
      text: '  Sol Rush',
      style: {
        fontSize: '90px',
        fill: '#ff0000',
        fontFamily: 'slugsRacer , Regular',
      },
    });
    title.setOrigin(0.5, 0.5);

    const title2 = this.make.text({
      x: this.width / 2,
      y: this.height / 2 - 80,
      text: 'Endless Run',
      style: {
        fontSize: '40px',
        fill: '#ff91c3',
        fontFamily: 'Cyberpunks, Regular',
      },
    });
    title2.setOrigin(0.5, 0.5);



        // Teks saldo pojok kanan
        this.balanceText = this.add.text(this.width - 20, 20, 'SOL: -  |  TOKEN: -', {
          fontSize: '20px',
          color: '#ffffff',
          fontFamily: 'Arcadia'
        }).setOrigin(1, 0);

        // === Tombol Profile di pojok kiri atas ===
        this.profileText = this.add.text(20, 20, 'Profile', {
          fontSize: '24px',
          color: '#00ffcc',
          fontFamily: 'orbitronlight',
          fontStyle: 'bold',
          backgroundColor: '#00000055', // kasih background transparan biar mirip tombol
          padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.profileIsPressed())
        .on('pointerup', () => {
          this.profileNotPressed();
          this.openProfile();   // <<< INI YANG MEMANGGIL POPUP
        });


            // Buat tombol berupa teks
    this.mintText = this.add.text(20, 20, "Mint Token", {
      fontSize: "32px",
      color: "#00ff00",
      fontFamily: "Arial",
      backgroundColor: "#00000055",
      padding: { left: 500, right: 10, top: 5, bottom: 5 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on("pointerdown", () => this.onMintPressed())
    .on("pointerup", async () => {
      if (!this.walletPublicKey) {
        console.log("Wallet belum terkoneksi!");
        this.showError("Silakan connect wallet dulu! ");
        return;
      }
      await this.handleMint();
    });

    // === Tombol Connect Wallet ===
    this.walletBtn = this.add.image(this.width / 2, this.height / 2, 'wallet')
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.5)
      .on('pointerdown', () => this.walletIsPressed())
      .on('pointerup', () => {
        // this.walletNotPressed();
        this.connectWallet();
      });


    this.playBtn = this.add.image(this.width / 2, this.height / 2, 'play').setInteractive({ useHandCursor: true }).setOrigin(0.5, 0.5)
      .on('pointerdown', () => this.playIsPressed())
      .on('pointerup', () => {
        this.playNotPressed();
        if (this.walletConnected) {
          this.start();
        } else {
          console.log("Wallet belum terkoneksi!");
          // bisa munculin popup / teks peringatan di layar
          this.showWalletWarning();
        }
      });

    // Contoh fungsi popup warning
this.showWalletWarning = function() {
  const warning = this.add.text(this.width / 2, this.height / 2 + 100,
    'Silakan konekkan wallet dulu!',
    { fontSize: '20px', fill: '#ff4444' }
  ).setOrigin(0.5);
  
  // Bisa auto hilang setelah beberapa detik
  this.time.delayedCall(2000, () => warning.destroy(), [], this);
};

      

        // // === Tombol Play (disembunyikan awalnya) ===
        // this.playBtn = this.add.image(this.width / 2, this.height / 2 + 100, 'play')
        // .setInteractive({ useHandCursor: true })
        // .setOrigin(0.5, 0.5)
        // .on('pointerdown', () => this.playIsPressed())
        // .on('pointerup', () => {
        //   this.playNotPressed();
        //   this.start();
        // });
      this.playBtn.setVisible(false); // disembunyikan dulu
  

    this.exitBtn = this.add.image(this.width / 2, this.height / 2 + 100, 'exit').setInteractive({ useHandCursor: true }).setOrigin(0.5, 0.5)
      .on('pointerdown', () => this.exitIsPressed())
      .on('pointerup', () => {
        this.exitNotPressed();
        this.exit();
      });
      this.exitBtn.setVisible(false); // disembunyikan dulu

    ['A', 'S', 'SPACE', 'ENTER'].forEach(key => {
      const keyP = this.input.keyboard.addKey(key);
      keyP.on('down', () => {
        // this.start();
        if (this.walletConnected) this.start();

      });
    });


    const menuItems = [
      { label: "Multiplayer", color: "#00ccff", action: () => this.openNotAvailable() },
      { label: "Inventory",   color: "#00ff99", action: () => this.openNotAvailable() },
      { label: "Shop",        color: "#ffcc00", action: () => this.openNotAvailable() },
      { label: "Marketplace", color: "#ffaa00", action: () => this.openNotAvailable() }
    ];
    

    const spacing = 180; // jarak antar tombol
    const baseY = 520;   // posisi vertikal
    
    menuItems.forEach((item, i) => {
      const totalWidth = (menuItems.length - 1) * spacing;   // total lebar menu
      const startX = this.width / 2 - totalWidth / 2;        // titik awal di kiri
      const x = startX + i * spacing;                        // posisi tiap item
    
      const text = this.add.text(x, baseY, item.label, {
        fontSize: "26px",
        color: item.color,
        fontFamily: "orbitronlight",
        fontStyle: "bold",
        backgroundColor: "#00000055",
        padding: { left: 15, right: 15, top: 5, bottom: 5 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {}) // efek press
      .on("pointerup", item.action);
    
      // text.setVisible(false);
    });
  }


  

  async connectWallet() {
    const provider = window.solana;
    if (provider && provider.isPhantom) {
      try {
        const resp = await provider.connect();
        console.log('Connected wallet:', resp.publicKey.toString());
        this.walletAddress = resp.publicKey.toString();

        this.walletPublicKey = resp.publicKey; // PublicKey object

        this.walletConnected = true;
        console.error('Connected wallet 01');

        // Setelah konek, sembunyikan tombol wallet, munculkan tombol play
        this.walletBtn.setVisible(false);
        console.error('Connected wallet 1');

        this.playBtn.setVisible(true);
        console.error('Connected wallet 2');

        this.exitBtn.setVisible(true);
        console.error('Connected wallet 3');

        // this.multiplayerText.setVisible(true);
        console.error('Connected wallet 4');

        // this.inventoryText.setVisible(true);
        console.error('Connected wallet 5');

        // this.shopText.setVisible(true);
        // this.text.setVisible(true);
        console.error('Connected wallet 111');

     // Ambil saldo pertama kali
     await this.refreshBalancesSafely();
      } catch (err) {
        console.error('User rejected connection', err);
      }
    } else {
      alert('Phantom wallet belum terpasang!');
    }
  }


  async refreshBalancesSafely() {
    console.error('refreshBalancesSafely 0');

    if (!this.walletConnected || !this.walletPublicKey) return;
    console.error('refreshBalancesSafely');

    try {
      const owner = this.walletPublicKey.toString();

      // SOL balance
      const sol = await getSolBalance(owner);

      // SPL token balance (coin dummy)
      const mint = this.getDummyMint();
      let tokenBalance = 0;
      try {
        tokenBalance = await getSplTokenBalance(owner, mint);
      } catch (e) {
        // jika belum punya ATA/saldo, tetap 0
        tokenBalance = 0;
      }

      this.balanceText.setText(`SOL: ${sol.toFixed(3)}  |  TOKEN: ${tokenBalance}`);
    } catch (e) {
      console.error('Gagal update saldo', e);
    }
  }

  getDummyMint() {
    // contoh placeholder; ganti dengan alamat mint SPL yang kamu buat di devnet
    return '5ttQ3kYx23HdaYhjK7w5a24vFQM27vfNZmini3N8XaN7';
  }
  

  start() {
    this.menuSong.stop();
    this.cameras.main.fadeOut(2000, 255, 255, 255);
    this.scene.start('instructions');
  }

  exit() {
    this.menuSong.stop();
    const ending = this.sound.add('ending', { volume: 0.25, loop: true });
    ending.play();
    this.cameras.main.fadeOut(2000, 0, 0, 0);
    this.scene.start('leaderboard-table', { song: ending });
  }

  update() {
    const bgs = [this.bg1,  this.bg3, this.bg4,  this.bg6, this.bg8];
    const fact = [0.1,  0.25, 0.4, 0.6, 1.5];

    bgs.forEach((bg, index) => {
      bg.tilePositionX += fact[index];
    });
  }
  openNotAvailable() {
    // === Panel Background (overlay) ===
    if (this.isNotAvailOpen) return; // Cegah spam klik
    this.isNotAvailOpen = true;
    this.notAvailOverlay = this.add.rectangle(
      this.width / 2,
      this.height / 2,
      this.width * 0.6,
      this.height * 0.4,
      0x000000,
      0.8
    ).setOrigin(0.5);
  
    // === Judul ===
    this.notAvailTitle = this.add.text(
      this.width / 2,
      this.height / 2 - 80,
      'COMING SOON',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arcadia',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
  
    // === Pesan ===
    this.notAvailMsg = this.add.text(
      this.width / 2,
      this.height / 2 - 20,
      'Stay tuned for updates.',
      {
        fontSize: '20px',
        color: '#ffcc00',
        fontFamily: 'Arcadia',
        align: 'center',
        wordWrap: { width: this.width * 0.5 }
      }
    ).setOrigin(0.5);
  
    // === Tombol Close ===
    this.notAvailCloseBtn = this.add.text(
      this.width / 2,
      this.height / 2 + 60,
      '[ Close ]',
      {
        fontSize: '22px',
        color: '#ff6666',
        fontFamily: 'Arcadia',
        fontStyle: 'bold',
        backgroundColor: '#ffffff22',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerup', () => this.closeNotAvailable());
  }
  
  closeNotAvailable() {
    this.notAvailOverlay.destroy();
    this.notAvailTitle.destroy();
    this.notAvailMsg.destroy();
    this.notAvailCloseBtn.destroy();
    this.isNotAvailOpen = false; 
  }
  

  openProfile() {
    // === Panel Background (overlay) ===
    if (this.isProfileOpen) return; // Cegah spam klik
    this.isProfileOpen = true;
    this.profileOverlay = this.add.rectangle(
      this.width / 2,
      this.height / 2,
      this.width * 0.6,
      this.height * 0.6,
      0x000000,
      0.8 // transparansi
    ).setOrigin(0.5, 0.5);
  
    // === Judul Profile ===
    this.profileTitle = this.add.text(this.width / 2, this.height / 2 - 120, 'PROFILE', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arcadia',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  
    // === Info Wallet ===
    const walletAddr = this.walletConnected ? this.walletPublicKey.toString() : "Not Connected";
  
    this.profileWallet = this.add.text(this.width / 2, this.height / 2 - 40,
      `Wallet: ${walletAddr}`,
      {
        fontSize: '18px',
        color: '#00ffcc',
        fontFamily: 'Arcadia',
        wordWrap: { width: this.width * 0.5 }
      }
    ).setOrigin(0.5);
  
    // === Info Balance ===
    this.profileBalance = this.add.text(this.width / 2, this.height / 2 + 10,
      this.balanceText.text, // ambil dari tampilan saldo yang sudah ada
      {
        fontSize: '20px',
        color: '#ffcc00',
        fontFamily: 'Arcadia'
      }
    ).setOrigin(0.5);
  
    // === Tombol Close ===
    this.profileCloseBtn = this.add.text(this.width / 2, this.height / 2 + 100, '[ Close ]', {
      fontSize: '22px',
      color: '#ff6666',
      fontFamily: 'Arcadia',
      fontStyle: 'bold',
      backgroundColor: '#ffffff22',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerup', () => this.closeProfile());
  }
  
  closeProfile() {
    // hapus semua elemen profile
    this.profileOverlay.destroy();
    this.profileTitle.destroy();
    this.profileWallet.destroy();
    this.profileBalance.destroy();
    this.profileCloseBtn.destroy();
    this.isProfileOpen = false; 
  }
  async handleMint() {
    try {
      const sig = await mintSPLToken(this.walletPublicKey);
      console.log("Mint sukses! Tx hash:", sig);
      this.mintText.setStyle({ color: "#00ff00" });
    } catch (err) {
      console.error("Mint gagal:", err);
      this.showError("Mint gagal!");
      this.mintText.setStyle({ color: "#ff0000" });
    }
  }
  
  showError(message) {
    const errorText = this.add.text(
      this.width / 2,
      this.height / 2 + 150,
      message,
      {
        fontSize: '22px',
        color: '#ff4444',
        fontFamily: 'Arcadia',
        backgroundColor: '#00000088',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }
    ).setOrigin(0.5);
  
    // Auto hilang setelah 2 detik
    this.time.delayedCall(2000, () => {
      errorText.destroy();
    });
  }

  playIsPressed() {
    this.playBtn.setTexture('playPressed');
  }

  playNotPressed() {
    this.playBtn.setTexture('play');
  }

  exitIsPressed() {
    this.exitBtn.setTexture('exitPressed');
  }

  exitNotPressed() {
    this.exitBtn.setTexture('exit');
  }

  walletIsPressed() { this.walletBtn.setTexture('wallet'); }
  walletNotPressed() { this.walletBtn.setTexture('wallet'); }

  profileIsPressed() {
    this.profileText.setStyle({ color: '#ffcc00' }); // ganti warna saat ditekan
  }
  
  profileNotPressed() {
    this.profileText.setStyle({ color: '#00ffcc' }); // kembali ke warna asli
  }
  
  multiplayerIsPressed() { this.multiplayerText.setStyle({ color: '#ffffff' }); }
multiplayerNotPressed() { this.multiplayerText.setStyle({ color: '#00ccff' }); }
openMultiplayer() { alert('Multiplayer mode belum dibuat'); }

inventoryIsPressed() { this.inventoryText.setStyle({ color: '#ffffff' }); }
inventoryNotPressed() { this.inventoryText.setStyle({ color: '#00ff99' }); }
openInventory() { alert('Inventory belum dibuat'); }

shopIsPressed() { this.shopText.setStyle({ color: '#ffffff' }); }
shopNotPressed() { this.shopText.setStyle({ color: '#ffcc00' }); }
openShop() { alert('Shop belum dibuat'); }

onMintPressed() {
  this.mintText.setStyle({ color: "#ffcc00" }); // ganti warna saat ditekan
}




}