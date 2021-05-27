import { check, validationResult, param } from 'express-validator';

module.exports = {
  // validation chain for register request
  confirmInvite: [
    check('inviteToken')
      .exists()
      .withMessage('Invite token Field is required'),
  ],
  inviteNewAgent: [
    check('email')
      .isEmail()
      .withMessage('Email Field must be a valid email address'),
    check('firstName')
      .exists()
      .withMessage('FirstName field cannot be empty'),
    check('lastName')
      .exists()
      .withMessage('LastName field cannot be empty'),
  ],
  completeNewAgent: [
    check('inviteToken')
      .exists()
      .withMessage('Invite token Field is required'),
    check('password')
      .exists()
      .withMessage('Invite token Field is required'),
    check('email')
      .isEmail()
      .withMessage('Email Field must be a valid email address'),
    check('firstName')
      .exists()
      .withMessage('FirstName field cannot be empty'),
    check('lastName')
      .exists()
      .withMessage('LastName field cannot be empty'),
  ],

  //   investment validators
  createInvestment: [
    check('investment.description')
      .exists()
      .withMessage('A description is required to complete this operation'),
    check('investment.headline')
      .exists()
      .withMessage('A catchy headline is required for this operation'),
  ],
  addFarm: [
    check('investment')
      .exists()
      .withMessage('Provide the object id of this investment'),
    check('farm.address')
      .exists()
      .withMessage('Provide the address of the farm'),
    check('farm.product.category')
      .exists()
      .withMessage('Provide the product category for this farm')
      .isIn(['livestocks', 'crops'])
      .withMessage(
        "Provide a valid frm product type. one of 'livestocks', 'crops'"
      ),
    check('farm.name')
      .exists()
      .withMessage('The name of the farm is need for this operation'),
    check('farm.photos')
      .isArray()
      .withMessage('provide a list of photos of the farm'),
    check('farm.product')
      .exists()
      .withMessage('provide detail of product coming from farm'),
    check('farm.product.name')
      .exists()
      .withMessage('provide the name of the farm product'),
    check('farm.product.photos')
      .isArray()
      .withMessage('provide a list of photos of the farm product'),
    check('farm.coordinates')
      .isArray()
      .withMessage('provide a list of geo location of the farm'),
  ],

  addFarmer: [
    check('investment')
      .exists()
      .withMessage('Provide the object id of this investment'),
    check('farmer.address')
      .exists()
      .withMessage('Provide the address of the farmer'),
    check('farmer.fullName')
      .exists()
      .withMessage('The name of the farmer is need for this operation'),
    check('farmer.photo')
      .exists()
      .withMessage('provide a photo of the farmer'),
    check('farmer.identification')
      .exists()
      .withMessage('provide a photo of the farmer identify card'),
    check('farmer.phone')
      .exists()
      .withMessage('provide a phone number for the farmer'),
    check('farmer.email')
      .exists()
      .withMessage('provide a list of photos of the farmer'),
    check('farmer.coordinates')
      .isArray()
      .withMessage('provide a list of geo location of the farmer'),
  ],
  addOffering: [
    check('investment')
      .exists()
      .withMessage('Provide the object id of this investment'),
    check('offering.totalUnits')
      .exists()
      .withMessage('Provide the total units offered'),
    check('offering.costPerUnit')
      .exists()
      .withMessage('provide the cost of each unit offered'),
    check('offering.returnPeriod')
      .exists()
      .withMessage('provide the period of return for this offering'),
    check('offering.totalReturn')
      .exists()
      .withMessage('provide the total percent return for this offering'),
  ],

  createFarmProduce: [
    check('produce.farm.address')
      .exists()
      .withMessage('Provide the address of the farm'),
    check('produce.category')
      .exists()
      .withMessage('Provide the product category for this farm')
      .isIn(['livestocks', 'crops'])
      .withMessage(
        "Provide a valid frm product type. one of 'livestocks', 'crops'"
      ),
    check('produce.farm.name')
      .exists()
      .withMessage('The name of the farm is need for this operation'),
    check('produce.photos')
      .isArray()
      .withMessage('provide a list of photos of the farm'),
    check('produce.name')
      .exists()
      .withMessage('provide the name of the farm product'),
    check('produce.farm.coordinates')
      .isArray()
      .withMessage('provide a list of geo location of the farm'),
  ],
};
