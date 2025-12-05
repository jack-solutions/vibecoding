const mongoose = require('mongoose');

const adCampaignSchema = mongoose.Schema({
    advertiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    budget: { type: Number, required: true },
    targeting: { type: String },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const AdCampaign = mongoose.model('AdCampaign', adCampaignSchema);
module.exports = AdCampaign;
