import { ethereum, JSONValue, json, ipfs, log, dataSource, BigInt, ByteArray } from "@graphprotocol/graph-ts"
import { NFTMinted } from "../generated/MyNFTMinter/Nft"
import { Token, User, Collection } from "../generated/schema"

export function handleNFTMinted(event: NFTMinted): void {

  let collection = Collection.load(dataSource.address().toHexString())

  if (!collection) {
    collection = new Collection(dataSource.address().toHexString())
    collection.creator = new ByteArray(0).toHexString()
    collection.isAllowed = false
    collection.createdAt = new BigInt(0)
    collection.updatedAt = new BigInt(0)
    collection.removedAt = new BigInt(0)
  }

  let token = Token.load(event.params.id.toString())
  if (!token) {
    token = new Token(event.params.id.toString())
    token.tokenId = event.params.id;
    // token.nftContract = dataSource.address().toHexString()
    token.collection = collection.id
    token.owner = event.params.owner.toHexString()
    token.createdAt = event.block.timestamp;
    token.metadata = event.params.tokenURI.toString()

    let metadataResult = ipfs.cat(event.params.tokenURI.toString().replace("ipfs://", ""))

    if (metadataResult) {
      const value = json.fromBytes(metadataResult).toObject()
      if (value) {
        const image = value.get('image')
        if (image) {
          token.image = image.toString()
        }
        const name = value.get('name')
        if (name) {
          token.name = name.toString()
        }
        const description = value.get('description')
        if (description) {
          token.description = description.toString()
        }
      }
    }

  }

  let user = User.load(event.params.owner.toString())
  if (!user) {
    user = new User(event.params.owner.toHexString())
    user.deposited = new BigInt(0)
    user.pendingToWithdraw = new BigInt(0)
    user.withdrawn = new BigInt(0)
  }
  collection.save()
  token.save()
  user.save()
}