import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {AddPurchaseDto} from "../dto/purchase/addPurchase.dto";
import {ResponseStatusInterface} from "../types/responseStatus.interface";
import {ResponseMessage} from "../response.message";
import {InjectRepository} from "@nestjs/typeorm";
import {PurchasesEntity} from "../../db/entity/purchases.entity";
import {Repository} from "typeorm";
import {CoinEntity} from "../../db/entity/coin.entity";
import {UserEntity} from "../../db/entity/user.entity";
import {UpdatePurchaseDto} from "../dto/purchase/updatePurchase.dto";

@Injectable()
export class PurchaseService {
    constructor(
        @InjectRepository(PurchasesEntity) private readonly purchaseRepository: Repository<PurchasesEntity>,
        @InjectRepository(CoinEntity) private readonly coinRepository: Repository<CoinEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) {}

    public async addPurchase(addPurchaseDto: AddPurchaseDto, userId: number): Promise<ResponseStatusInterface> {
        if(!await this.coinRepository.exist({
            where: {
                id: addPurchaseDto.coinId
            }})) throw new BadRequestException(ResponseMessage.coinDoesNotExists);
        const userCoins = await this.userRepository.findOne({
            relations: {
                coins: true
            },
            where: {
                id: userId
            }
        });
        if(!userCoins.coins.some(coin => coin.id == addPurchaseDto.coinId)) {
            throw new BadRequestException(ResponseMessage.userDontHaveCoin);
        }
        const purchase = new PurchasesEntity();
        const totalPrice: number = addPurchaseDto.price * addPurchaseDto.count;
        const coin = new CoinEntity();
        const user = new UserEntity();
        coin.id = addPurchaseDto.coinId;
        user.id = userId;
        Object.assign(purchase,addPurchaseDto)
        purchase.coin = coin;
        purchase.user = user;
        purchase.totalPrice = totalPrice;
        await this.purchaseRepository.save(purchase);
        return {status: ResponseMessage.success};
    }

    public async updatePurchase(updatePurchaseDto: UpdatePurchaseDto,purchaseId: number, userId: number): Promise<ResponseStatusInterface> {
        const isPurchaseExists: boolean = await this.purchaseRepository.
        createQueryBuilder("purchases").
        where("id = :id",{id: purchaseId}).
        andWhere("user_id = :userId", {userId: userId}).
        getExists();
        if(!isPurchaseExists) throw new NotFoundException(ResponseMessage.purchaseNotFound);
        const purchase: PurchasesEntity = await this.purchaseRepository.findOne({
            where: {
                id: purchaseId
            }
        })
        Object.assign(purchase,updatePurchaseDto);
        purchase.totalPrice = purchase.price * purchase.count;
        await this.purchaseRepository.save(purchase);
        return {status: ResponseMessage.success};
    }

    public async deletePurchase(purchaseId: number, userId: number): Promise<ResponseStatusInterface> {
        const isPurchaseExists: boolean = await this.purchaseRepository.
        createQueryBuilder("purchases").
        where("id = :id",{id: purchaseId}).
        andWhere("user_id = :userId", {userId: userId}).
        getExists();
        if(!isPurchaseExists) throw new NotFoundException(ResponseMessage.purchaseNotFound);
        await this.purchaseRepository.delete(purchaseId);
        return {status: ResponseMessage.success};
    }
}