import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  //product등록하기
  @Post('create')
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const newProduct = await this.productService.productCreate(
      createProductDto,
    );
    return newProduct;
  }
  @Get()
  async getAllProducts() {
    const products = await this.productService.productGetAll();
    return products;
  }

  //상세정보
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    const product = await this.productService.productGetById(id);
    return product;
  }
  @Put('id')
  async updatedProductById(
    @Body() createProductDto: CreateProductDto,
    @Param('id') id: string,
  ) {
    return await this.productService.productUpdateById(id, createProductDto);
  }

  //product delete
  @Delete('id')
  async deleteProductById(@Param('id') id: string) {
    const product = await this.productService.productDeleteById(id);
    return product;
  }
}
