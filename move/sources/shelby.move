module shelby::vault {
    use std::vector;
    use std::string;
    use aptos_framework::timestamp;
    use aptos_framework::account;

    struct FileRecord has copy, drop, store {
        name: string::String,
        hash: vector<u8>,
        uploaded_at: u64,
    }

    struct Vault has key {
        files: vector<FileRecord>,
    }

    /// Initialize vault for a wallet
    public entry fun init(account: &signer) {
        move_to(account, Vault {
            files: vector::empty<FileRecord>(),
        });
    }

    /// Add new file record
    public entry fun add_file(
        account: &signer,
        name: string::String,
        hash: vector<u8>
    ) acquires Vault {
        let vault = borrow_global_mut<Vault>(account::address_of(account));

        vector::push_back(
            &mut vault.files,
            FileRecord {
                name,
                hash,
                uploaded_at: timestamp::now_seconds(),
            }
        );
    }

    /// Read-only helper
    public fun get_files(addr: address): vector<FileRecord>
    acquires Vault {
        borrow_global<Vault>(addr).files
    }
}
