import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}
  async productCreate(createProductDto: CreateProductDto) {
    const newProduct = await this.productRepository.create(createProductDto);
    await this.productRepository.save(newProduct);
    return newProduct;
  }

  //전체불러오는 로직
  async productGetAll() {
    const products = await this.productRepository.find();
    return { count: products.length, products };
  }

  async productGetById(id: string) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new HttpException('No id', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  async productDeleteById(id: string) {
    await this.productRepository.delete({ id });
    return 'deleted product';
  }

  async productUpdateById(id: string, createProductDto: CreateProductDto) {
    await this.productRepository.update(id, createProductDto);
    return 'updated product';
  }
}
